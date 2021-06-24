import {Service, UseOpts} from "@tsed/di";
import {
  ACTIONS,
  Clip,
  Dictionary,
  MediaType,
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

import {ActionTriggerEventBus} from "./action-trigger-event.bus";
import {ScriptHandler} from "./scripts/script.handler";
import {timeoutAsync} from "./scripts/apis/sleep.api";

@Service()
export class ActionTriggerHandler {
  private _allScreens: Screen[] = [];
  private _allMediasMap: Dictionary<Clip> = {};
  private _allMediasList: Clip[] = [];

  constructor(
    @UseOpts({name: 'ActionTriggerHandler'}) public logger: NamedLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private mediaTriggerEventBus: ActionTriggerEventBus,
    private _memeboxWebSocket: MemeboxWebsocket,
    private _scriptHandler: ScriptHandler
  ) {
    mediaTriggerEventBus.AllEvents$.subscribe(triggerMedia => {
      this.triggerMediaClipById(triggerMedia);
    });

    _persistence.dataUpdated$().subscribe(() => {
      this.getData();
    })

    this.getData();
  }

  async triggerMediaClipById(payloadObs: TriggerAction) {
    this.logger.info(`Clip triggered: ${payloadObs.id} - Target: ${payloadObs.targetScreen ?? 'Any'} - Origin: ${payloadObs.origin}`, payloadObs);

    const mediaConfig = this._allMediasMap[payloadObs.id];

    switch (mediaConfig.type) {
      case MediaType.Meta:
        this.triggerMeta(mediaConfig);
        break;
      case MediaType.Script:
        this._scriptHandler.handleScript(mediaConfig, payloadObs);
        break;
      default: {
        if (payloadObs.targetScreen) {
          this._memeboxWebSocket.sendDataToScreen(payloadObs.targetScreen, `${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(payloadObs)}`);
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

            this._memeboxWebSocket.sendDataToScreen(screen.id, `${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(newMessageObj)}`);
          }
        }
      }
    }
  }


  private async triggerMeta(mediaConfig: Clip): Promise<void> {
    // Get all Tags
    const assignedTags = mediaConfig.tags || [];

    if (assignedTags.length === 0) {
      return;
    }

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

        this.triggerMediaClipById({
          id: clipToTrigger.id,
          origin: TriggerClipOrigin.Meta,
          originId: mediaConfig.id
        });

        break;
      }
      case MetaTriggerTypes.All: {
        allClips.forEach(clipToTrigger => {
          this.triggerMediaClipById({
            id: clipToTrigger.id,
            origin: TriggerClipOrigin.Meta,
            originId: mediaConfig.id
          });
        });

        break;
      }
      case MetaTriggerTypes.AllDelay: {

        for (const clipToTrigger of allClips) {
          await this.triggerMediaClipById({
            id: clipToTrigger.id,
            origin: TriggerClipOrigin.Meta,
            originId: mediaConfig.id
          });
          await timeoutAsync(mediaConfig.metaDelay)
        }

        break;
      }
    }
  }

  private getData() {
    this._allScreens = this._persistence.listScreens();
    this._allMediasMap = this._persistence.fullState().clips;
    this._allMediasList = Object.values(this._allMediasMap);
  }
}
