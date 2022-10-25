import {Service, UseOpts} from "@tsed/di";
import {
  Action,
  ACTION_TYPE_INFORMATION,
  ACTIONS,
  ActionStateEnum,
  ActionType,
  Dictionary,
  Screen,
  TriggerAction,
  TriggerActionOrigin
} from "@memebox/contracts";
import {Persistence} from "../../persistence";
import {NamedLogger} from "../named-logger";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {MemeboxWebsocket} from "../websockets/memebox.websocket";

import {ActionQueueEventBus} from "./action-queue-event.bus";
import {ScriptHandler} from "./scripts/script.handler";
import {ActionActiveStateEventBus} from "./action-active-state-event.bus";
import {ActionQueue} from "./action-queue";
import {ActionActiveState} from "./action-active-state";

@Service()
export class ActionTriggerHandler {
  private _allScreens: Screen[] = [];
  private _allActionsMap: Dictionary<Action> = {};

  private _actionQueue = new ActionQueue(
    this._persistence,
    this.actionState,
    async (triggerAction) => {
      await this.triggerActionById(triggerAction)
    }
  )

  constructor(
    @UseOpts({name: 'ActionTriggerHandler'}) public logger: NamedLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private actionQueueEventBus: ActionQueueEventBus,
    private _memeboxWebSocket: MemeboxWebsocket,
    private _scriptHandler: ScriptHandler,
    private actionStateEventBus: ActionActiveStateEventBus,
    private actionState: ActionActiveState
  ) {
    actionQueueEventBus.AllQueuedActions$.subscribe(triggerMedia => {
      this._actionQueue.triggerAndWaitUntilDone(triggerMedia);
    });

    actionQueueEventBus.AllUpdateEvents$.subscribe(triggerMedia => {
      this.updateMediaEvent(triggerMedia);
    });

    _persistence.dataUpdated$().subscribe(() => {
      this.getData();
    })

    this.getData();
  }

  async triggerActionById(triggerPayload: TriggerAction) {
   this.logTriggerInformation(triggerPayload);

    const mediaConfig = this._allActionsMap[triggerPayload.id];

    switch (mediaConfig.type) {
      case ActionType.Script:
        await this._scriptHandler.handleScript(mediaConfig, triggerPayload);
        break;
      case ActionType.Recipe:
        await this._scriptHandler.handleRecipe(mediaConfig, triggerPayload);
        break;
      default: {
        if (triggerPayload.targetScreen) {
          this.triggerActionOnScreen(triggerPayload);
          return;
        }

        // No Meta Type
        // Trigger the action on all assign screens
        for (const screen of this._allScreens) {
          if (screen.clips[triggerPayload.id]) {
            const newMessageObj: TriggerAction = {
              ...triggerPayload,
              targetScreen: screen.id
            };

            this.triggerActionOnScreen(newMessageObj);
          }
        }
      }
    }

    return triggerPayload;
  }

  triggerActionOnScreen (payload: TriggerAction): void  {
    if (!this._memeboxWebSocket.isScreenActive(payload.targetScreen)) {
      return;
    }

    this.actionStateEventBus.updateActionState({
      mediaId: payload.id,
      screenId: payload.targetScreen,
      state: ActionStateEnum.Triggered,
      overrides: payload.overrides
    });

    this._memeboxWebSocket.sendDataToScreen(payload.targetScreen, `${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(payload)}`);
  }

  updateMediaEvent(payloadObs: TriggerAction): void  {
    if (payloadObs.targetScreen) {
      this._memeboxWebSocket.sendDataToScreen(payloadObs.targetScreen, `${ACTIONS.UPDATE_MEDIA}=${JSON.stringify(payloadObs)}`);
      return;
    }

    // No Meta Type
    // Trigger the clip on all assign screens
    for (const screen of this._allScreens) {
      if (screen.clips[payloadObs.id]) {
        const newMessageObj = {
          ...payloadObs,
          targetScreen: screen.id
        };

        this._memeboxWebSocket.sendDataToScreen(screen.id, `${ACTIONS.UPDATE_MEDIA}=${JSON.stringify(newMessageObj)}`);
      }
    }
  }

  private logTriggerInformation(triggerPayload: TriggerAction) {
    const actionInfo = this._allActionsMap[triggerPayload.id];

    const screenName = triggerPayload.targetScreen
      ? this._allScreens.find(s => s.id === triggerPayload.targetScreen)?.name ?? '[Unknown] '+triggerPayload.targetScreen
      : 'any';

    const originLabel = triggerPayload.origin
      ? TriggerActionOrigin[triggerPayload.origin]
      : '[Unknown] ' +triggerPayload.origin;

    const typeName = ACTION_TYPE_INFORMATION[actionInfo.type]?.labelFallback ?? '[Unknown]';

    this.logger.info(`${typeName} triggered: "${actionInfo.name}" - Target-Screen: ${screenName} - Origin: ${originLabel}`, triggerPayload);
  }

  private getData() {
    this._allScreens = this._persistence.listScreens();
    this._allActionsMap = this._persistence.fullState().clips;
  }
}
