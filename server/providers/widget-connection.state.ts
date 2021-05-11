import {Injectable, UseOpts} from "@tsed/di";
import {MemeboxWebsocket} from "./websockets/memebox.websocket";
import {ACTIONS} from "@memebox/contracts";
import {NamedLogger} from "./named-logger";

@Injectable()
export class WidgetConnectionState {
  private connectionState: Record<string, { connectedInstances: string[], mainId: string }> = { }

  constructor(
    private memeboxWebSocket: MemeboxWebsocket,

    @UseOpts({name: 'WidgetConnectionState'}) private logger: NamedLogger,
  ) {
    memeboxWebSocket.ReceivedActions$.subscribe(({type, payload}) => {
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

          break;
        }
        case ACTIONS.UNREGISTER_WIDGET_INSTANCE: {
          const [mediaId, instanceId] = payload.split('|');

          if (this.connectionState[mediaId]) {
            const mediaInformation = this.connectionState[mediaId];

            const indexOfInstance = mediaInformation.connectedInstances.indexOf(instanceId);

            mediaInformation.connectedInstances.splice(indexOfInstance, 1);

            if (mediaInformation.mainId === instanceId) {
              mediaInformation.mainId = mediaInformation.connectedInstances[0];
            }
          }

          this.logger.info({type, payload, state: this.connectionState[mediaId]});

          break;
        }
      }
    });
  }

  public isTheMainInstance(mediaId: string, instanceId: string) {
    return this.connectionState[mediaId]?.mainId === instanceId;
  }
}
