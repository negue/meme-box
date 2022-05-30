import { Injectable, UseOpts } from "@tsed/di";
import { MemeboxWebsocket } from "./websockets/memebox.websocket";
import { ACTIONS, ActionStateEnum } from "@memebox/contracts";
import { NamedLogger } from "./named-logger";
import { ActionActiveStateEventBus } from "./actions/action-active-state-event.bus";

// skipcq: JS-0579
@Injectable()
export class WidgetConnectionState {
  private connectedSocketMap = new Map<string, WebSocket>();
  private connectionState: Record<string, { connectedInstances: string[], mainId: string }> = { }

  constructor(
    private memeboxWebSocket: MemeboxWebsocket,
    private actionActiveState: ActionActiveStateEventBus,

    @UseOpts({name: 'WidgetConnectionState'}) private logger: NamedLogger,
  ) {
    memeboxWebSocket.ReceivedActions$.subscribe(({type, payload, ws}) => {
      switch (type) {
        case ACTIONS.REGISTER_WIDGET_INSTANCE: {
          const [mediaId, instanceId] = payload.split('|');

          if (this.connectionState[mediaId]) {
           const mediaInformation = this.connectionState[mediaId];

            mediaInformation.connectedInstances.push(instanceId);

            if (mediaInformation.connectedInstances.length === 1) {
              mediaInformation.mainId = instanceId;
            }

          } else {
            this.connectionState[mediaId] = {
              connectedInstances: [instanceId],
              mainId: instanceId
            };
          }

          this.logger.info({type, payload, state: this.connectionState[mediaId]});

          this.connectedSocketMap[instanceId] = ws;

          ws.once("close", () => {
            this.unregisterWidgetConnection(mediaId, instanceId);
            this.logger.info({type: 'Unregister by WS Close', payload, state: this.connectionState[mediaId]});
          });

          break;
        }
        case ACTIONS.UNREGISTER_WIDGET_INSTANCE: {
          const [mediaId, instanceId] = payload.split('|');

          this.unregisterWidgetConnection(mediaId, instanceId);

          this.logger.info({type, payload, state: this.connectionState[mediaId]});

          break;
        }
      }
    });
  }

  public isTheMainInstance(mediaId: string, instanceId: string): boolean  {
    return this.connectionState[mediaId]?.mainId === instanceId;
  }

  private unregisterWidgetConnection (mediaId: string, instanceId: string)  {
    this.actionActiveState.updateActionState({
      mediaId,
      state: ActionStateEnum.Unset,
      overrides: null
    });

    if (this.connectionState[mediaId]) {
      const mediaInformation = this.connectionState[mediaId];

      const indexOfInstance = mediaInformation.connectedInstances.indexOf(instanceId);

      mediaInformation.connectedInstances.splice(indexOfInstance, 1);

      if (mediaInformation.mainId === instanceId) {
        mediaInformation.mainId = mediaInformation.connectedInstances[0];
      }
    }
  }
}
