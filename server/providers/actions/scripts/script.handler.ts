import { Service, UseOpts } from "@tsed/di";
import { VM } from "vm2";
import { Action, ActionStateEnum, ActionType, TriggerAction } from "@memebox/contracts";
import { NamedLogger } from "../../named-logger";
import { Inject } from "@tsed/common";
import { PERSISTENCE_DI } from "../../contracts";
import { Persistence } from "../../../persistence";
import { ActionQueueEventBus } from "../action-queue-event.bus";
import { ActionActiveState } from "../action-active-state";
import { ActionActiveStateEventBus } from "../action-active-state-event.bus";
import { ActionStore, ActionStoreAdapter } from "@memebox/shared-state";
import { ScriptContext } from "./script.context";
import { ActionPersistentStateHandler } from "../action-persistent-state.handler";
import { MemeboxApiFactory } from "./apis/memebox.api";
import { ObsConnection } from "../../obs-connection";
import { ObsApi } from "./apis/obs.api";
import { TwitchConnector } from "../../twitch/twitch.connector";
import { TwitchApi } from "./apis/twitch.api";
import { TwitchDataProvider } from "../../twitch/twitch.data-provider";
import { setGlobalVMScope } from "./global.context";
import { TwitchQueueEventBus } from "../../twitch/twitch-queue-event.bus";
import { actionDataToScriptConfig, ScriptConfig } from "@memebox/utils";
import { generateCodeByRecipe } from "@memebox/recipe-core";

const ActionTypesToResetScriptContext = [
  ActionType.Script,
  ActionType.PermanentScript,
  ActionType.Recipe
];

@Service()
export class ScriptHandler implements ActionStoreAdapter {
  private obsApi: ObsApi;

  private _compiledScripts = new Map<string, ScriptContext>();

  // TODO / check can it run multiple longer-scripts at once?
  private _vm = new VM({
    sandbox: {
    },
    eval: false
  });

  constructor (
    @UseOpts({name: 'ScriptHandler'}) public logger: NamedLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private actionTriggerEventBus: ActionQueueEventBus,
    private actionStateEventBus: ActionActiveStateEventBus,
    private actionActiveState: ActionActiveState,
    private actionStateHandler: ActionPersistentStateHandler,
    private memeboxApiFactory: MemeboxApiFactory,
    private obsConnection: ObsConnection,
    private twitchConnector: TwitchConnector,
    private twitchDataProvider: TwitchDataProvider,
    private twitchEventBus: TwitchQueueEventBus,
  ) {
    setGlobalVMScope(this._vm);

    _persistence.dataUpdated$().subscribe((changedInfo) => {
      if (
        changedInfo.dataType == 'action'
        && ActionTypesToResetScriptContext.includes(changedInfo.actionType)
      ) {
        this.refreshCompiledScriptsAndStartPermanents(changedInfo.id);
      }

      if (changedInfo.dataType === 'everything') {
        this.refreshCompiledScriptsAndStartPermanents();
      }
    })

    this.refreshCompiledScriptsAndStartPermanents();
  }

  public async getObsApi (): Promise<ObsApi> {
    if (this.obsApi) {
      return this.obsApi;
    }

    const obsWebsocket = await this.obsConnection.getCurrentConnection();

    this.obsConnection.tryConnecting();

    return this.obsApi = new ObsApi(this.obsConnection, obsWebsocket);
  }

  // region ActionStoreAdapter

  public getCurrentData (mediaId: string): Promise<ActionStore> {
    return this.actionStateHandler
      .getActionFileHandler(mediaId)
      .loadFile({})
  }

  public updateData (mediaId: string, instanceId: string, newData: ActionStore): void  {
    return this.actionStateHandler
      .getActionFileHandler(mediaId)
      .update(newData);
  }

  // endregion ActionStoreAdapter

  public async handleRecipe(script: Action, payloadObs: TriggerAction) {
    const generatedScript = generateCodeByRecipe(script.recipe);

    const scriptConfig: ScriptConfig = {
      bootstrapScript: '',
      variablesConfig: [],
      executionScript: generatedScript,
      settings: {

      }
    };

    return this.handleGenericScript(script, scriptConfig, payloadObs);
  }

  public handleScript (script: Action, payloadObs: TriggerAction) {
    this.logger.info('Handle Script!!');

    const scriptConfig = actionDataToScriptConfig(script);

    return this.handleGenericScript(script, scriptConfig, payloadObs);
  }

  private async handleGenericScript(
    script: Action,
    scriptConfig: ScriptConfig,
    payloadObs: TriggerAction
  ) {
    // todo rename logs per target type script/recipe

    this.actionStateEventBus.updateActionState({
      mediaId: script.id,
      state: ActionStateEnum.Active,
      overrides: payloadObs?.overrides
    });

    let scriptHoldingData: ScriptContext;

    if (this._compiledScripts.has(script.id)) {
      scriptHoldingData = this._compiledScripts.get(script.id);
    } else {
      const obsApi = await this.getObsApi();   // TODO trigger obs connection without waiting for it

      // todo extract ScriptContextFactory?!
      scriptHoldingData = new ScriptContext(
        this._vm,
        this,
        script,
        scriptConfig,
        this.memeboxApiFactory.getApiFor(script.id, script.type),
        this.logger,
        obsApi,
        new TwitchApi(this.twitchConnector, this.twitchEventBus, this.twitchDataProvider, script.type)
      );

      try {
        scriptHoldingData.compile();
      } catch (err) {
        this.logger.error(err.message, 'Script: '+script.name);
        return;
      }
      this._compiledScripts.set(script.id, scriptHoldingData);
    }

    try {
      await scriptHoldingData.execute(payloadObs);
    } catch (err) {
      this.logger.error(err, `Failed to run script for "${script.name}" [${script.id}]`);
    }

    const scriptRunningType = script.type === ActionType.PermanentScript
      ? 'is running'
      : 'is done';

    this.logger.info(`Script "${script.name}" ${scriptRunningType}.`);

    this.actionStateEventBus.updateActionState({
      mediaId: script.id,
      state: ActionStateEnum.Done,
      overrides: null
    });
  }

  private async refreshCompiledScriptsAndStartPermanents (
    scriptIdToReset?: string
  ) {
    if (scriptIdToReset && this._compiledScripts.has(scriptIdToReset)) {
      this.disposeScript(scriptIdToReset);
    } else {
      for (const scriptContext of this._compiledScripts.keys()) {
        this.disposeScript(scriptContext);
      }

      this._compiledScripts.clear();
    }

    // start each permanent script after another
    for (const action of this._persistence.listActions()) {
      if (
        (!scriptIdToReset || action.id === scriptIdToReset)
        && action.type === ActionType.PermanentScript
      && action.isActive) {
        await this.handleScript(action, null);
      }
    }
  }

  private disposeScript (scriptId: string): void {
    const cachedCompiledScript = this._compiledScripts.get(scriptId);

    cachedCompiledScript.dispose();

    if (cachedCompiledScript.script.type === ActionType.PermanentScript) {
      this.logger.info(`Script: "${cachedCompiledScript.script.name}" stopped.`);
    } else {
      this.logger.info(`Script Cache: "${cachedCompiledScript.script.name}" cleared.`);
    }

    this._compiledScripts.delete(scriptId);
  }
}
