import {Service, UseOpts} from "@tsed/di";
import {VM} from "vm2";
import {Action, ActionStateEnum, ActionType, TriggerAction} from "@memebox/contracts";
import {NamedLogger} from "../../named-logger";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../../contracts";
import {Persistence} from "../../../persistence";
import {ActionQueueEventBus} from "../action-queue-event.bus";
import {ActionActiveState} from "../action-active-state";
import {ActionActiveStateEventBus} from "../action-active-state-event.bus";
import {ActionStore, ActionStoreAdapter} from "@memebox/shared-state";
import {ScriptContext} from "./script.context";
import {ActionPersistentStateHandler} from "../action-persistent-state.handler";
import {MemeboxApiFactory} from "./apis/memebox.api";
import {ObsConnection} from "../../obs-connection";
import {ObsApi} from "./apis/obs.api";
import {TwitchConnector} from "../../twitch/twitch.connector";
import {TwitchApi} from "./apis/twitch.api";
import {TwitchDataProvider} from "../../twitch/twitch.data-provider";
import {setGlobalVMScope} from "./global.context";
import {TwitchQueueEventBus} from "../../twitch/twitch-queue-event.bus";

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

  constructor(
    @UseOpts({name: 'ScriptHandler'}) public logger: NamedLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private actionTriggerEventBus: ActionQueueEventBus,
    private actionStateEventBus: ActionActiveStateEventBus,
    private actionActiveState: ActionActiveState,

    private actionStateHandler: ActionPersistentStateHandler,
    private memeboxApiFactory: MemeboxApiFactory,
    private obsConnection : ObsConnection,

    private twitchConnector: TwitchConnector,
    private twitchDataProvider: TwitchDataProvider,
    private twitchEventBus: TwitchQueueEventBus,
  ) {
    setGlobalVMScope(this._vm);

    _persistence.dataUpdated$().subscribe((changedInfo) => {
      if (
        changedInfo.dataType == 'action'
        && [ActionType.Script, ActionType.PermanentScript].includes(changedInfo.actionType)
      ) {
        this.refreshCompiledScriptsAndStartPermanents(changedInfo.id);
      }

      if (changedInfo.dataType === 'everything') {
        this.refreshCompiledScriptsAndStartPermanents();
      }
    })

    this.refreshCompiledScriptsAndStartPermanents();
  }

  public async getObsApi() : Promise<ObsApi> {
    if (this.obsApi) {
      return this.obsApi;
    }

    const obsWebsocket = await this.obsConnection.getCurrentConnection();

    this.obsConnection.tryConnecting();

    return this.obsApi = new ObsApi(this.obsConnection, obsWebsocket);
  }

  // region ActionStoreAdapter

  public getCurrentData(mediaId: string): Promise<ActionStore> {
    return this.actionStateHandler
      .getActionFileHandler(mediaId)
      .loadFile({})
  }

  public updateData(mediaId: string, instanceId: string, newData: ActionStore) {
    return this.actionStateHandler
      .getActionFileHandler(mediaId)
      .update(newData);
  }

  // endregion ActionStoreAdapter

  public async handleScript(script: Action, payloadObs: TriggerAction) {
    this.logger.info('Handle Script!!');

    this.actionStateEventBus.updateActionState({
      mediaId: script.id,
      state: ActionStateEnum.Active
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
    }
    catch(err) {
      this.logger.error(err, `Failed to run script for "${script.name}" [${script.id}]`);
    }

    this.logger.info(`Script "${script.name}" is done.`);

    this.actionStateEventBus.updateActionState({
      mediaId: script.id,
      state: ActionStateEnum.Done
    });
  }

  private async refreshCompiledScriptsAndStartPermanents(changedScriptId?: string) {
    // todo only reset the script by id

    // go through all scripts and dispose the APIs/subscriptions
    if (this._compiledScripts) {
      for (const scriptContext of this._compiledScripts.values()) {
        scriptContext.dispose();
      }
    }

    this._compiledScripts = new Map<string, ScriptContext>();

    // start each permanent script after another
    for (const action of this._persistence.listActions()) {
      if (action.type === ActionType.PermanentScript) {
        await this.handleScript(action, null);
      }
    }
  }
}

