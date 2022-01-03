import {Service, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import * as WebSocket from "ws";
import {ActionActiveStatePayload, ACTIONS, Dictionary, TriggerAction} from "@memebox/contracts";
import {Subject} from "rxjs";
import {ActionQueueEventBus} from "../actions/action-queue-event.bus";
import {ActionActiveStateEventBus} from "../actions/action-active-state-event.bus";
import {AbstractWebsocketHandler} from "./abstract-websocket-handler";

// UNTIL everything in the backend is refactored to TSED, we need some global instance
export let CURRENT_MEMEBOX_WEBSOCKET: MemeboxWebsocket;

@Service()
export class MemeboxWebsocket extends AbstractWebsocketHandler {
  private _socketsPerScreen: Dictionary<WebSocket[]> = {};

  private _receivedActions$ = new Subject<{type: string, payload: string, ws: WebSocket}>();

  public ReceivedActions$ = this._receivedActions$.asObservable();

  constructor(
    @UseOpts({name: 'WS.MemeBox'}) public logger: NamedLogger,
    private mediaTriggerEventBus: ActionQueueEventBus,
    private mediaStateEventBus: ActionActiveStateEventBus
  ) {
    super('');

    CURRENT_MEMEBOX_WEBSOCKET = this;
  }

  sendDataToScreen(targetId: string|null, message: string) {
    if (this._socketsPerScreen[targetId]) {
      for (const targetScreenSocket of this._socketsPerScreen[targetId]) {
        if (targetScreenSocket.readyState === WebSocket.OPEN) {
          targetScreenSocket.send(message);
          this.logger.info('SENT DATA TO: ', {targetId, message});
        }
      }
    }
  }

  isScreenActive (screenId: string): boolean  {
    if (!this._socketsPerScreen[screenId]) {
      return false;
    }

    return this._socketsPerScreen[screenId].some(ws => ws.readyState === WebSocket.OPEN);
  }

  sendDataToAllSockets(message) {
    super.sendDataToAllSockets(message);
  }

  handleWebSocketMessage(ws: WebSocket, message: string) {
    //log the received message and send it back to the client
    // console.log("received: %s", message);
    // ws.send(`Hello, you sent -> ${message}`);

    // ACTION={payload}
    const [action, payload] = message.split('=');

    this._receivedActions$.next({
      type: action,
      payload,
      ws,
    });

    // console.info({action, payload});

    switch (action) {
      case ACTIONS.I_AM_OBS: {
        if (this._socketsPerScreen[payload]) {
          this._socketsPerScreen[payload].push(ws);
        } else {
          this._socketsPerScreen[payload] = [ws];
        }

        this._connectedSocketList.push(ws);
        break;
      }
      case ACTIONS.TRIGGER_CLIP: {
        const payloadObs: TriggerAction = JSON.parse(payload);
        payloadObs.fromWebsocket = true;

        this.logger.info(`TRIGGER DATA TO - Target: ${payloadObs.targetScreen ?? 'Any'}`, payloadObs);

        // TODO refactor this dependency pingpong

        if (!payloadObs.targetScreen) {
          this.mediaTriggerEventBus.queueAction(payloadObs);
        } else {
          this.sendDataToScreen(payloadObs.targetScreen, message);
        }

        break;
      }
      case ACTIONS.RELOAD_SCREEN: {
        this.sendDataToScreen(payload, message);
        break;
      }
      case ACTIONS.MEDIA_STATE: {
        const mediaStatePayload: ActionActiveStatePayload = JSON.parse(payload);

        console.warn('RECEIVED MEDIA STATE', mediaStatePayload);

        this.mediaStateEventBus.updateActionState(mediaStatePayload);

        break;
      }
    }
  }

  WebSocketServerLabel = 'WS: Memebox Connections';
}
