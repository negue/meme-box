import {Service, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import * as WebSocket from "ws";
import {ACTIONS, Dictionary, MediaType, MetaTriggerTypes, TriggerClip} from "@memebox/contracts";
import {PersistenceInstance} from "../../persistence";

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

  private _wss = new WebSocket.Server({  noServer: true });


  constructor(
    @UseOpts({name: 'WS.MemeBox'}) public logger: NamedLogger,
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


        this.logger.info(`TRIGGER DATA TO - Target: ${payloadObs.targetScreen ?? 'Any'}`, payloadObs);

        if (!payloadObs.targetScreen) {
          this.triggerMediaClipById(payloadObs);
        } else {
          this.sendDataToScreen(payloadObs.targetScreen, message);
        }

        break;
      }
      case ACTIONS.RELOAD_SCREEN: {
        this.sendDataToScreen(payload, message);
        break;
      }
    }
  }


  async triggerMediaClipById(payloadObs: TriggerClip) {
    this.logger.info(`Clip triggered: ${payloadObs.id} - Target: ${payloadObs.targetScreen ?? 'Any'}`, payloadObs);

    // TODO refactor to class properties/fields
    const allScreens = PersistenceInstance.listScreens();
    const clipConfig = PersistenceInstance.fullState().clips[payloadObs.id];

    if (clipConfig.type !== MediaType.Meta) {
      // No Meta Type
      // Trigger the clip on all assign screens
      for (const screen of allScreens) {
        if (screen.clips[payloadObs.id]) {
          const newMessageObj = {
            ...payloadObs,
            targetScreen: screen.id
          };

          this.sendDataToScreen(screen.id, `${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(newMessageObj)}`);
        }
      }
    } else {
      // Get all Tags
      const assignedTags = clipConfig.tags || [];

      if (assignedTags.length === 0) {
        return;
      }

      // Get all clips assigned with these tags
      const allClips = PersistenceInstance.listClips().filter(
        clip => clip.id !== clipConfig.id && clip.tags && clip.tags.some(tagId => assignedTags.includes(tagId))
      );
      // per metaType
      switch (clipConfig.metaType) {
        case MetaTriggerTypes.Random: {
          // random 0..1
          const randomIndex = Math.floor(Math.random()*allClips.length);

          const clipToTrigger = allClips[randomIndex];

          this.triggerMediaClipById(clipToTrigger);

          break;
        }
        case MetaTriggerTypes.All: {
          allClips.forEach(clipToTrigger => {
            this.triggerMediaClipById(clipToTrigger);
          });

          break;
        }
        case MetaTriggerTypes.AllDelay: {

          for (const clipToTrigger of allClips) {
            await this.triggerMediaClipById(clipToTrigger);
            await timeoutAsync(clipConfig.metaDelay)
          }

          break;
        }
      }
    }
  }
}

function timeoutAsync(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

