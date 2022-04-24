import * as WebSocket from "ws";
import {BehaviorSubject} from "rxjs";

export abstract class AbstractWebsocketHandler {
  protected _connectedSocketList: WebSocket[] = [];
  protected _wss = new WebSocket.Server({noServer: true});

  private _connectionCount$ = new BehaviorSubject(0);

  public ConnectionCount$ = this._connectionCount$.asObservable();

  abstract WebSocketServerLabel: string;

  constructor(public websocketPath: string) {
    this._wss.on("connection", (ws: WebSocket) => {
      this._connectedSocketList.push(ws);
      this.onConnectedSocket(ws);
      this.updateConnectionCount();

      //connection is up, let's add a simple simple event
      ws.on("message", (message) => {
        const stringMessage = message.toString();

        this.handleWebSocketMessage(ws, stringMessage);
      });

      ws.on("error", err => {
        const indexOf = this._connectedSocketList.indexOf(ws);

        if (indexOf < 0) {
          return;
        }

        this._connectedSocketList.splice(indexOf, 1);
        this.updateConnectionCount();
      });

      ws.on("close", err => {
        this.onSocketClosed(ws);

        const indexOf = this._connectedSocketList.indexOf(ws);

        if (indexOf < 0) {
          return;
        }

        this._connectedSocketList.splice(indexOf, 1);
        this.updateConnectionCount();
      });
    });
  }

  handleUpgrade(request: any, socket: any, head: any): void  {
    this._wss.handleUpgrade(request, socket, head, (ws) => {
      this._wss.emit('connection', ws, request);
    });
  }


  protected sendDataToAllSockets (message: string): void  {
    if (this._connectedSocketList.length === 0) {
      return;
    }

    this.sendDataToSockets(message, this._connectedSocketList);
  }

  protected sendDataToSockets(message: string, targetSockets: WebSocket[]): void  {
    for (const targetSocket of targetSockets) {
      if (targetSocket.readyState === WebSocket.OPEN) {
        targetSocket.send(message);
      }
    }
  }

  protected onConnectedSocket(ws: WebSocket): void {
  }

  protected onSocketClosed (ws: WebSocket): void {}

  protected handleWebSocketMessage(ws: WebSocket, message: string): void {}

  private updateConnectionCount () {
    this._connectionCount$.next(this._connectedSocketList.length);
  }
}
