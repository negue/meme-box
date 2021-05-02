import {Service, UseOpts} from "@tsed/di";
import {NamedLogger} from "../named-logger";
import * as WebSocket from "ws";
import {TwitchConnector} from "../twitch/twitch.connector";


// todo maybe extract?
interface WebSocketType {
  send(message: string);
  readyState: number;
}

@Service()
export class TwitchEventsWebsocket {
  private _connectedSocketList: WebSocketType[] = [];

  private _wss = new WebSocket.Server({  noServer: true });

  constructor(
    @UseOpts({name: 'WS.Twitch'}) public logger: NamedLogger,
    private twitchConnection: TwitchConnector
  ) {
/*
    wss2.handleUpgrade(request, socket, head, function done(ws) {
      wss2.emit('connection', ws, request);
    });*/

    this._wss.on("connection", (ws: WebSocket) => {

      console.info('new Twitch WS Connection');

      this._connectedSocketList.push(ws);

      //connection is up, let's add a simple simple event
      ws.on("message", (message: string) => {
        this.handleWebSocketMessage(ws, message);
      });
    });

    twitchConnection.twitchEvents$()
      .subscribe(twitchEvent => {
        this.sendDataToAllSockets(JSON.stringify(twitchEvent));
      })
  }

  handleUpgrade(request: any, socket: any, head: any) {
    this._wss.handleUpgrade(request, socket, head, (ws) => {
      this._wss.emit('connection', ws, request);
    });
  }

  sendDataToAllSockets (message: string) {
    if (this._connectedSocketList.length === 0) {
      return;
    }

    this._connectedSocketList.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });


    this.logger.info(`Sent TwitchEvent to ${this._connectedSocketList.length} Connections:`, {message});
  }

  handleWebSocketMessage(ws: WebSocket, message: string) {
    // No client actions handled yet / needed
  }
}

