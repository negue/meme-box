import {clipDataToScriptConfig, getScriptVariablesOrFallbackValues, ScriptConfig} from "@memebox/utils";
import {VM, VMScript} from "vm2";
import {ActionStoreAdapter, ActionStoreApi} from "@memebox/state";
import {Clip, Dictionary, TriggerAction} from "@memebox/contracts";
import {Subject} from "rxjs";
import {Sleep, sleep} from "./apis/sleep.api";
import {MemeboxApi} from "./apis/memebox.api";
import {NamedLogger} from "../../named-logger";
import {LoggerApi} from "./apis/logger.api";
import {ObsApi} from "./apis/obs.api";
import {TwitchApi} from "./apis/twitch.api";
import {CanDispose} from "./apis/disposableBase";

class ScriptCompileError extends Error {
  constructor(script: Clip,
              public scriptType: 'bootstrap'|'execution',
              public baseError: Error) {
    super(`Failed to compile the ${scriptType} Script "${script.name}" [${script.id}]: \n${baseError.message}`);
  }
}

interface SharedScriptPayload {
  variables: Dictionary<unknown>;
  store: ActionStoreApi;
  sleep: Sleep;
  memebox: MemeboxApi;
  logger: LoggerApi;
  obs: ObsApi;
  twitch: TwitchApi;
}

const SHARED_API_ARGUMENTS = 'variables, store, sleep, memebox, logger, obs, twitch';

interface ExecutionScriptPayload extends SharedScriptPayload {
  bootstrap: Record<string, unknown>;
  triggerPayload: TriggerAction;
}

type ExecutionScript = (
  payload: ExecutionScriptPayload
) => Promise<void>;

export class ScriptContext implements CanDispose {
  scriptConfig: ScriptConfig;

  // API Properties
  store: ActionStoreApi;
  logger: LoggerApi;

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
    public script: Clip,
    public memeboxApi: MemeboxApi,
    baseLogger: NamedLogger,
    public obsApi: ObsApi,
    public twitchApi: TwitchApi
  ) {
    this.scriptConfig = clipDataToScriptConfig(script);

    // TODO error$ subject for logger or other stuff
    var error$ = new Subject<string>();

    this.store = new ActionStoreApi(
      script.id,
      script.id,
      storeAdapter,
      error$
    );

    this.logger = new LoggerApi(script.name, baseLogger);
  }

  public compile() {
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
      throw new ScriptCompileError(this.script,'bootstrap', err);
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

      throw new ScriptCompileError(this.script,'execution', err);
    }
  }

  public async bootstrap(variables: Dictionary<unknown>) : Promise<void> {
    if (!this.isBootstrapped) {
      const bootstrapFunc = this._vm.run(this.compiledBootstrapScript);

      const bootstrapPayload: SharedScriptPayload = {
        variables,
        store: this.store,
        sleep,
        memebox: this.memeboxApi,
        logger: this.logger,
        obs: this.obsApi,
        twitch: this.twitchApi
      }

      this.bootstrap_variables = await bootstrapFunc(bootstrapPayload);
      this.isBootstrapped = true;
    }
  }

  public async execute(payloadObs: TriggerAction) : Promise<void> {
    // TODO apply variable overrides from TriggerClip

    const variables = getScriptVariablesOrFallbackValues(
      this.scriptConfig,
      this.script.extended
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
      triggerPayload: payloadObs,
      store: this.store,
      sleep,
      memebox: this.memeboxApi,
      logger: this.logger,
      obs: this.obsApi,
      twitch: this.twitchApi
    };

    await this.scriptToCall(scriptArguments);
  }

  public dispose(): void {
    this.memeboxApi.dispose();
    this.twitchApi.dispose();
    this.obsApi.dispose();
  }
}
