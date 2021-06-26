import {Service, UseOpts} from "@tsed/di";
import {VM} from "vm2";
import OBSWebSocket from "obs-websocket-js";
import {Clip, TriggerAction, TriggerClipOrigin} from "@memebox/contracts";
import {NamedLogger} from "../../named-logger";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../../contracts";
import {Persistence} from "../../../persistence";
import {ActionTriggerEventBus} from "../action-trigger-event.bus";
import {ActionActiveState} from "../action-active-state";
import {ActionActiveStateEventBus} from "../action-active-state-event.bus";
import {ActionStore, ActionStoreAdapter} from "@memebox/state";
import {ScriptContext} from "./script.context";
import {ActionPersistentStateHandler} from "../action-persistent-state.handler";
import {MemeboxApiFactory} from "./apis/memebox.api";

@Service()
export class ScriptHandler implements ActionStoreAdapter {

  private _compiledScripts = new Map<string, ScriptContext>();

  // TODO / check can it run multiple longer-scripts at once?
  private _vm = new VM({
    sandbox: {
      console: {
        info: (...args) => {
          this.logger.info(...args)
        }
      },
      getObsWebsocket: (address: string, password?: string) => {
        const obs = new OBSWebSocket();
        obs.connect({ address, password });

        return obs;
      },
      triggerMediaAsync: (targetMediaId: string, targetScreenId?: string) => {
        this.mediaTriggerEventBus.triggerMedia({
          id: targetMediaId,
          targetScreen: targetScreenId,
          origin: TriggerClipOrigin.Scripts
        });

        return this.mediaActiveState.waitUntilDoneAsync(targetMediaId, targetScreenId);
      }
    }
  });

  constructor(
    @UseOpts({name: 'ScriptHandler'}) public logger: NamedLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private mediaTriggerEventBus: ActionTriggerEventBus,
    private mediaStateEventBus: ActionActiveStateEventBus,
    private mediaActiveState: ActionActiveState,

    private actionStateHandler: ActionPersistentStateHandler,
    private memeboxApiFactory: MemeboxApiFactory
  ) {
    _persistence.dataUpdated$().subscribe(() => {
      // TODO get updated Path to know what kind of state needs to be refilled
      // for example the compiled scripts

      this._compiledScripts = new Map<string, ScriptContext>();
    })

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

  public async handleScript(script: Clip, payloadObs: TriggerAction) {
    this.logger.info('Handle Script!!');

    this.mediaStateEventBus.updateMediaState({
      mediaId: script.id,
      active: true
    });

    let scriptHoldingData: ScriptContext;

    if (this._compiledScripts.has(script.id)) {
      scriptHoldingData = this._compiledScripts.get(script.id);
    } else {
      scriptHoldingData = new ScriptContext(
        this._vm,
        this,
        script,
        this.memeboxApiFactory.getApiFor(script.id)
      );

      try {
        scriptHoldingData.compile();
     } catch (err) {
      this.logger.error(err.message);
      return;
    }
      this._compiledScripts.set(script.id, scriptHoldingData);
    }

    try {
      await scriptHoldingData.execute(payloadObs);
    }
    catch(err) {
      this.logger.error(`Failed to run script for "${script.name}" [${script.id}]`, err);
    }

    this.logger.info(`Script "${script.name}" is done.`);

    this.actionStateEventBus.updateActionState({
      mediaId: script.id,
      state: ActionStateEnum.Done
    });
  }
}

