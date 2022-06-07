import {Observable} from "rxjs";
import * as WebSocket from "ws";
import {take} from "rxjs/operators";
import {AbstractWebsocketHandler} from "./abstract-websocket-handler";
import {timeoutAsync} from "../actions/scripts/apis/sleep.api";

export abstract class AbstractSimpleObservableWebSocketService
  extends AbstractWebsocketHandler {
  protected constructor (
    websocketPath: string,
    private observable$: Observable<unknown>
  ) {
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

    if (!this.shouldSentDefaultValue(observableData)) {
      return;
    }

    let counter = 0;

    while (ws.readyState !== ws.OPEN && counter <= 20) {
      await timeoutAsync(250);
      counter++;
    }

    if (ws.readyState !== ws.OPEN) {
      return;
    }

    const jsonToSend = JSON.stringify(observableData);
    ws.send(jsonToSend);
  }

  // skipcq: JS-0356
  protected shouldSentDefaultValue(_data: unknown): boolean {
    return true;
  }
}
