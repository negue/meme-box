import {Service, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import * as WebSocket from "ws";
import {ACTIONS, Dictionary, MediaStatePayload, TriggerClip} from "@memebox/contracts";
import {Subject} from "rxjs";
import {MediaTriggerEventBus} from "../media/media-trigger.event-bus";

// todo maybe extract?
interface WebSocketType {
  send(message: string);
  readyState: number;
}

// UNTIL everything in the backend is refactored to TSED, we need some global instance
export let CURRENT_MEMEBOX_WEBSOCKET: MemeboxWebsocket;

@Service()
export class MemeboxWebsocket {
  private _socketsPerScreen: Dictionary<WebSocketType[]> = {};
  private _connectedSocketList: WebSocketType[] = [];

  private _receivedActions$ = new Subject<{type: string, payload: string, ws: WebSocket}>();
  private _wss = new WebSocket.Server({  noServer: true });

  public ReceivedActions$ = this._receivedActions$.asObservable();

  constructor(
    @UseOpts({name: 'WS.MemeBox'}) public logger: NamedLogger,
    private mediaTriggerEventBus: MediaTriggerEventBus
  ) {
    CURRENT_MEMEBOX_WEBSOCKET = this;

    this._wss.on("connection", (ws: WebSocket) => {
      //connection is up, let's add a simple simple event
      ws.on("message", (message: string) => {
        this.handleWebSocketMessage(ws, message);
      });

      //send immediatly a feedback to the incoming connection
      ws.send("Hi there, I am a WebSocket server");
    });

  }

  handleUpgrade(request: any, socket: any, head: any) {
    this._wss.handleUpgrade(request, socket, head, (ws) => {
      this._wss.emit('connection', ws, request);
    });
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

  sendDataToAllSockets (message: string) {
    this._connectedSocketList.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);

        this.logger.info('SENT DATA TO ALL:', {message});
      }
    });
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
        const payloadObs: TriggerClip = JSON.parse(payload);
        payloadObs.fromWebsocket = true;

        this.logger.info(`TRIGGER DATA TO - Target: ${payloadObs.targetScreen ?? 'Any'}`, payloadObs);

        // TODO refactor this dependency pingpong

        if (!payloadObs.targetScreen) {
          this.mediaTriggerEventBus.triggerMedia(payloadObs);
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
        const mediaStatePayload: MediaStatePayload = JSON.parse(payload);

        console.info('mediaState', {
          mediaStatePayload
        });

        break;
      }
    }
  }
}
