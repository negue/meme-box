import {Service, UseOpts} from "@tsed/di";
import {
  Action,
  ACTIONS,
  ActionStateEnum,
  ActionType,
  Dictionary,
  MetaTriggerTypes,
  Screen,
  TriggerAction,
  TriggerClipOrigin
} from "@memebox/contracts";
import {Persistence} from "../../persistence";
import {NamedLogger} from "../named-logger";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {MemeboxWebsocket} from "../websockets/memebox.websocket";

import {ActionQueueEventBus} from "./action-queue-event.bus";
import {ScriptHandler} from "./scripts/script.handler";
import {timeoutAsync} from "./scripts/apis/sleep.api";
import {ActionActiveStateEventBus} from "./action-active-state-event.bus";
import {uuid} from "@gewd/utils";
import {ActionQueue} from "./action-queue";
import {ActionActiveState} from "./action-active-state";

@Service()
export class ActionTriggerHandler {
  private _allScreens: Screen[] = [];
  private _allMediasMap: Dictionary<Action> = {};
  private _allMediasList: Action[] = [];

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

  async triggerActionById(payloadObs: TriggerAction) {
    this.logger.info(`Clip triggered: ${payloadObs.id} - Target: ${payloadObs.targetScreen ?? 'Any'} - Origin: ${payloadObs.origin}`, payloadObs);

    const mediaConfig = this._allMediasMap[payloadObs.id];

    switch (mediaConfig.type) {
      case ActionType.Meta:
        await this.triggerMeta(mediaConfig, payloadObs);
        break;
      case ActionType.Script:
        await this._scriptHandler.handleScript(mediaConfig, payloadObs);
        break;
      default: {
        if (payloadObs.targetScreen) {
          this.triggerActionOnScreen(payloadObs);
          return;
        }

        // No Meta Type
        // Trigger the action on all assign screens
        for (const screen of this._allScreens) {
          if (screen.clips[payloadObs.id]) {
            const newMessageObj: TriggerAction = {
              ...payloadObs,
              targetScreen: screen.id
            };

            this.triggerActionOnScreen(newMessageObj);
          }
        }
      }
    }

    return payloadObs;
  }

  triggerActionOnScreen (payload: TriggerAction): void  {
    if (!this._memeboxWebSocket.isScreenActive(payload.targetScreen)) {
      return;
    }

    this.actionStateEventBus.updateActionState({
      mediaId: payload.id,
      screenId: payload.targetScreen,
      state: ActionStateEnum.Triggered
    });

    this._memeboxWebSocket.sendDataToScreen(payload.targetScreen, `${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(payload)}`);
  }

  async updateMediaEvent(payloadObs: TriggerAction) {
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

  private async triggerMeta(mediaConfig: Action, payloadObs: TriggerAction): Promise<void> {
    // Get all Tags
    const assignedTags = mediaConfig.tags || [];

    if (assignedTags.length === 0) {
      this.actionStateEventBus.updateActionState({
        mediaId: mediaConfig.id,
        state: ActionStateEnum.Done
      });

      return;
    }

    this.actionStateEventBus.updateActionState({
      mediaId: mediaConfig.id,
      state: ActionStateEnum.Active
    });

    // Get all clips assigned with these tags
    const allClips = this._allMediasList.filter(
      clip => clip.id !== mediaConfig.id && clip.tags && clip.tags.some(tagId => assignedTags.includes(tagId))
    );
    // per metaType
    switch (mediaConfig.metaType) {
      case MetaTriggerTypes.Random: {
        // random 0..1
        const randomIndex = Math.floor(Math.random() * allClips.length);

        const clipToTrigger = allClips[randomIndex];

        await this._actionQueue.triggerAndWaitUntilDone({
          id: clipToTrigger.id,
          uniqueId: uuid(),
          origin: TriggerClipOrigin.Meta,
          originId: mediaConfig.id,
          originUniqueId: payloadObs.uniqueId
        });

        break;
      }
      case MetaTriggerTypes.All: {
        const allPromises: Promise<string>[] = [];

        allClips.forEach(clipToTrigger => {
          allPromises.push(
            this._actionQueue.triggerAndWaitUntilDone({
              id: clipToTrigger.id,
              uniqueId: uuid(),
              origin: TriggerClipOrigin.Meta,
              originId: mediaConfig.id,
              originUniqueId: payloadObs.uniqueId
            })
          );
        });

        await Promise.all(allPromises);

        break;
      }
      case MetaTriggerTypes.AllDelay: {

        for (const clipToTrigger of allClips) {
          await this._actionQueue.triggerAndWaitUntilDone({
            id: clipToTrigger.id,
            uniqueId: uuid(),
            origin: TriggerClipOrigin.Meta,
            originId: mediaConfig.id,
            originUniqueId: payloadObs.uniqueId
          });
          await timeoutAsync(mediaConfig.metaDelay)
        }

        break;
      }
    }

    this.actionStateEventBus.updateActionState({
      mediaId: mediaConfig.id,
      state: ActionStateEnum.Done
    });
  }

  private getData() {
    this._allScreens = this._persistence.listScreens();
    this._allMediasMap = this._persistence.fullState().clips;
    this._allMediasList = Object.values(this._allMediasMap);
  }
}
