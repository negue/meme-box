import * as WebSocket from "ws";
import { BehaviorSubject } from "rxjs";

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
      ws.on("message", (message: string) => {
        this.handleWebSocketMessage(ws, message);
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
        const indexOf = this._connectedSocketList.indexOf(ws);

        if (indexOf < 0) {
          return;
        }

        this._connectedSocketList.splice(indexOf, 1);
        this.updateConnectionCount();
      });
    });
  }

  handleUpgrade(request: any, socket: any, head: any) {
    this._wss.handleUpgrade(request, socket, head, (ws) => {
      this._wss.emit('connection', ws, request);
    });
  }


  protected sendDataToAllSockets (message: string) {
    if (this._connectedSocketList.length === 0) {
      return;
    }

    this._connectedSocketList.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  protected onConnectedSocket(ws: WebSocket): void {
  }

  protected handleWebSocketMessage(ws: WebSocket, message: string): void {}

  private updateConnectionCount () {
    this._connectionCount$.next(this._connectedSocketList.length);
  }
}
