import {Service, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import * as WebSocket from "ws";
import {ActionActiveStatePayload, ACTIONS, Dictionary, TriggerAction} from "@memebox/contracts";
import {Subject} from "rxjs";
import {ActionQueueEventBus} from "../actions/action-queue-event.bus";
import {ActionActiveStateEventBus} from "../actions/action-active-state-event.bus";
import {AbstractWebsocketHandler} from "./abstract-websocket-handler";
import {ScreenActiveStateEventBus} from "../screens/screen-active-state-event.bus";

// UNTIL everything in the backend is refactored to TSED, we need some global instance
export let CURRENT_MEMEBOX_WEBSOCKET: MemeboxWebsocket;

@Service()
export class MemeboxWebsocket extends AbstractWebsocketHandler {
  private _socketsPerScreen: Dictionary<WebSocket[]> = {};
  private _manageViewSockets: WebSocket[] = [];

  private _receivedActions$ = new Subject<{type: string, payload: string, ws: WebSocket}>();

  public ReceivedActions$ = this._receivedActions$.asObservable();

  constructor(
    @UseOpts({name: 'WS.MemeBox'}) public logger: NamedLogger,
    private mediaTriggerEventBus: ActionQueueEventBus,
    private mediaStateEventBus: ActionActiveStateEventBus,
    private screenEventBus: ScreenActiveStateEventBus
  ) {
    super('');

    CURRENT_MEMEBOX_WEBSOCKET = this;
  }

  sendDataToScreen(targetId: string|null, message: string) {
    if (!this._socketsPerScreen[targetId]) {
      return;
    }

    this.sendDataToSockets(message, this._socketsPerScreen[targetId]);
  }

  isScreenActive (screenId: string): boolean  {
    if (!this._socketsPerScreen[screenId]) {
      return false;
    }

    return this._socketsPerScreen[screenId].some(ws => ws.readyState === WebSocket.OPEN);
  }

  // used for usages of CURRENT_MEMEBOX_WEBSOCKET
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

        this.screenEventBus.updateScreenState({
          screenId: payload,
          state: true
        });

        break;
      }
      case ACTIONS.I_AM_MANAGE: {
        this._manageViewSockets.push(ws);
        break;
      }
      case ACTIONS.TRIGGER_CLIP: {
        const payloadObs: TriggerAction = JSON.parse(payload);
        payloadObs.fromWebsocket = true;

        this.sendDataToSockets(message, this._manageViewSockets);

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

        this.logger.warn('RECEIVED MEDIA STATE', mediaStatePayload);

        this.mediaStateEventBus.updateActionState(mediaStatePayload);

        break;
      }
    }
  }

  protected onSocketClosed(ws: WebSocket) {
    this.logger.info('OnSocketClosed');
    const manageViewSocketIndex = this._manageViewSockets.indexOf(ws);

    if (manageViewSocketIndex != -1) {
      this._manageViewSockets.splice(manageViewSocketIndex, 1);
    }

    for (const [screenId, connectedWS] of Object.entries(this._socketsPerScreen)) {
      const socketFoundIndex = connectedWS.indexOf(ws);

      if (socketFoundIndex != -1) {
        connectedWS.splice(socketFoundIndex, 1);
      }

      if (connectedWS.length === 0) {
        this.screenEventBus.updateScreenState({
          screenId,
          state: false
        });
      }
    }
  }

  WebSocketServerLabel = 'WS: Memebox Connections';
}
