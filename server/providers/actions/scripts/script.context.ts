import { getScriptVariablesOrFallbackValues, ScriptConfig } from "@memebox/utils";
import { VM, VMScript } from "vm2";
import { ActionStoreAdapter, ActionStoreApi } from "@memebox/shared-state";
import { Action, ActionType, Dictionary, TriggerAction } from "@memebox/contracts";
import { Subject } from "rxjs";
import { MemeboxApi } from "./apis/memebox.api";
import { NamedLogger } from "@memebox/server-common";
import { LoggerApi } from "./apis/logger.api";
import { ObsApi } from "./apis/obs.api";
import { TwitchApi } from "./apis/twitch.api";
import { CanDispose } from "./apis/disposableBase";
import { DummyWebSocketServer, RealWebSocketServer, WebSocketServerApi } from "./apis/wss.api";
import { EventBusApi } from "./apis/eventbus.api";
import { listAllEntriesOfTypes, RecipeCommandRegistry } from "@memebox/recipe-core";
import jsonata from "jsonata";


class ScriptCompileError extends Error {
  constructor(script: Action,
              public scriptType: 'bootstrap' | 'execution',
              public baseError: Error) {
    super(`Failed to compile the ${scriptType} Script "${script.name}" [${script.id}]: \n${baseError.message}`);
  }
}

interface SharedScriptPayload {
  variables: Dictionary<unknown>;
  store: ActionStoreApi;
  memebox: MemeboxApi;
  logger: LoggerApi;
  obs: ObsApi;
  twitch: TwitchApi;
  wss: WebSocketServerApi;
  eventBus: EventBusApi;
}

const SHARED_API_ARGUMENTS = 'variables, store, memebox, logger, obs, twitch, wss, eventBus, commandBlockData';

const JSONATA_REGEX = /\${{\s*(.*)\s*}}/gm;

interface ExecutionScriptPayload extends SharedScriptPayload {
  bootstrap: Record<string, unknown>;
  triggerPayload: TriggerAction;
  commandBlockData: {
    [key: string]: {
      [configName: string]: () => Promise<unknown>
    }
  }
}

type ExecutionScript = (
  payload: ExecutionScriptPayload
) => Promise<void>;

export class ScriptContext implements CanDispose {


  // API Properties
  store: ActionStoreApi;
  logger: LoggerApi;
  wss: WebSocketServerApi;
  eventBus: EventBusApi;

  // VMScript Parts
  isBootstrapped: boolean;
  compiledBootstrapScript: VMScript;
  bootstrap_variables: Record<string, unknown>;
  compiledExecutionScript: VMScript;

  // created execution function
  scriptToCall: ExecutionScript;

  constructor(
    private _vm: VM,
    storeAdapter: ActionStoreAdapter,
    public script: Action,
    private scriptConfig: ScriptConfig,
    public memeboxApi: MemeboxApi,
    baseLogger: NamedLogger,
    public obsApi: ObsApi,
    public twitchApi: TwitchApi
  ) {
    const isPermanentScript = this.script.type === ActionType.PermanentScript;

    // TODO error$ subject for logger or other stuff
    const error$ = new Subject<string>();

    this.store = new ActionStoreApi(
      script.id,
      script.id,
      storeAdapter,
      error$
    );

    this.logger = new LoggerApi(script.name, baseLogger);

    this.wss = isPermanentScript
      ? new RealWebSocketServer()
      : new DummyWebSocketServer();

    this.eventBus = new EventBusApi();
  }

  public compile(): void {
    try {
      this.compiledBootstrapScript = new VMScript(`
          async function bootstrap(
            { ${SHARED_API_ARGUMENTS} }
          ) {
            ${this.scriptConfig.bootstrapScript}
          }

          (bootstrap);
        `).compile();
    } catch (err) {
      throw new ScriptCompileError(this.script, 'bootstrap', err);
    }

    try {
      this.compiledExecutionScript = new VMScript(`
          async function scriptInVm(
            { ${SHARED_API_ARGUMENTS}, bootstrap, triggerPayload }
          ) {
            ${this.scriptConfig.executionScript}
          }

          (scriptInVm)
        `).compile();
    } catch (err) {

      throw new ScriptCompileError(this.script, 'execution', err);
    }
  }

  public async bootstrap(variables: Dictionary<unknown>): Promise<void> {
    if (!this.isBootstrapped) {
      const bootstrapFunc = this._vm.run(this.compiledBootstrapScript);

      const bootstrapPayload: SharedScriptPayload = {
        variables,
        store: this.store,
        memebox: this.memeboxApi,
        logger: this.logger,
        obs: this.obsApi,
        twitch: this.twitchApi,
        wss: this.wss,
        eventBus: this.eventBus
      }

      this.bootstrap_variables = await bootstrapFunc(bootstrapPayload);
      this.isBootstrapped = true;
    }
  }

  public async execute(triggerActionPayload: TriggerAction): Promise<void> {
    // TODO apply variable overrides from TriggerClip

    const variables = getScriptVariablesOrFallbackValues(
      this.scriptConfig.variablesConfig ?? [],
      this.script.extended,
      triggerActionPayload?.overrides?.action?.variables
    );

    if (!this.scriptToCall) {
      await Promise.all([
        this.bootstrap(variables),
        this.store.ready()
      ]);

      this.scriptToCall = this._vm.run(this.compiledExecutionScript);
    }

    // these are the available APIs / variables that can be used inside
    const scriptArguments: ExecutionScriptPayload = {
      variables,
      bootstrap: this.bootstrap_variables,
      triggerPayload: triggerActionPayload,
      store: this.store,
      memebox: this.memeboxApi,
      logger: this.logger,
      obs: this.obsApi,
      twitch: this.twitchApi,
      wss: this.wss,
      eventBus: this.eventBus,
      commandBlockData: {}
    };

    this.attacheRecipeCommandArguments(scriptArguments, triggerActionPayload);

    await this.scriptToCall(scriptArguments);
  }

  private attacheRecipeCommandArguments(
    scriptArguments: ExecutionScriptPayload,
    triggerActionPayload: TriggerAction
  ) {
    if (this.script.type !== ActionType.Recipe) {
      return;
    }

    if (!this.script.recipe) {
      return;
    }

    for (const recipeCommand of listAllEntriesOfTypes(
      this.script.recipe, this.script.recipe.rootEntry
    )) {
      const commandConfig = RecipeCommandRegistry[recipeCommand.commandBlockType];

      for (const configArgument of commandConfig.configArguments) {
        const configArgumentValue = recipeCommand.payload[configArgument.name].toString();
        scriptArguments.commandBlockData[recipeCommand.id] ??= {};

        if (configArgumentValue.includes('${{')) {
          scriptArguments.commandBlockData[recipeCommand.id][configArgument.name] = async () => {
            let replacedValue = configArgumentValue;
            this.logger.log(`Config ${configArgument.name} Argument RAW: ${configArgumentValue}`);
            for (const matchAllElement of configArgumentValue.matchAll(JSONATA_REGEX)) {
              // todo cache jsonataQuery
              const jsonataQuery = matchAllElement[1].trim();
              const jsonataExpression = jsonata(jsonataQuery);
              replacedValue = replacedValue.replaceAll(matchAllElement[0], await jsonataExpression.evaluate(triggerActionPayload))
            }

            this.logger.log(`Config ${configArgument.name} Argument Replaced: ${replacedValue}`);
            return replacedValue;
          };
        } else {
          scriptArguments.commandBlockData[recipeCommand.id][configArgument.name] = () => {
            return Promise.resolve(recipeCommand.payload[configArgument.name]);
          };
        }
      }
    }
  }

  public dispose(): void {
    this.memeboxApi.dispose();
    this.twitchApi.dispose();
    this.obsApi.dispose();
    this.wss.dispose();
    this.eventBus.dispose();
  }
}
