import * as WebSocket from "ws";

export abstract class AbstractWebsocketHandler {
  protected _connectedSocketList: WebSocket[] = [];
  protected _wss = new WebSocket.Server({noServer: true});

  constructor(public websocketPath: string) {
    this._wss.on("connection", (ws: WebSocket) => {
      this._connectedSocketList.push(ws);
      this.onConnectedSocket(ws);

      //connection is up, let's add a simple simple event
      ws.on("message", (message: string) => {
        this.handleWebSocketMessage(ws, message);
      });
    });
  }

  handleUpgrade(request: any, socket: any, head: any) {
    this._wss.handleUpgrade(request, socket, head, (ws) => {
      this._wss.emit('connection', ws, request);
    });
  }


  protected sendDataToAllSockets (message: unknown) {
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
}
