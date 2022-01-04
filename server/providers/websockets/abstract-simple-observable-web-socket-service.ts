import { Observable } from "rxjs";
import * as WebSocket from "ws";
import { take } from "rxjs/operators";
import { AbstractWebsocketHandler } from "./abstract-websocket-handler";

export abstract class AbstractSimpleObservableWebSocketService
  extends AbstractWebsocketHandler {
  protected constructor (
    websocketPath: string,
    private observable$: Observable<unknown>) {
    super(websocketPath);

    observable$.subscribe(value => {
      const jsonToSend = JSON.stringify(value);
      this.sendDataToAllSockets(jsonToSend);
    });
  }

  protected async onConnectedSocket (ws: WebSocket) {
    const observableData = await this.observable$.pipe(
      take(1)
    ).toPromise();

    const jsonToSend = JSON.stringify(observableData);
    ws.send(jsonToSend);
  }
}
