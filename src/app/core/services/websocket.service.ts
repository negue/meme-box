import {Injectable} from '@angular/core';
import {DEFAULT_PORT} from "../../../../server/constants";
import {TriggerClip} from "@memebox/contracts";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public onOpenConnection$ = new Subject();
  public onUpdateData$ = new Subject();
  public onTriggerClip$ = new Subject<TriggerClip>();

  private ws: WebSocket;
  private isConnected = false;

  constructor() {
   setTimeout(() => this.connect(), 150);
  }

  public connect() {
    if (this.isConnected) {
      return;
    }

    this.ws = new WebSocket(`ws://${location.hostname}:${DEFAULT_PORT}`);

    this.ws.onopen = ev => {
      this.isConnected = true;
      this.onOpenConnection$.next();
    };

    this.ws.onmessage = event => {
      console.debug("WebSocket message received:", event);

      const dataAsString = event.data as string;

      // console.error({dataAsString});

      const [action, payload] = dataAsString.split('=');

      switch (action) {
        case 'TRIGGER_CLIP': {
          const payloadObj: TriggerClip = JSON.parse(payload);

          this.onTriggerClip$.next(payloadObj);

          break;
        }
        case 'UPDATE_DATA': {
          this.onUpdateData$.next();
        }
      }

    };
  }

  public sendI_Am_OBS(guid: string) {
    this.ws.send(`I_AM_OBS=${guid}`);
  }


  public triggerClipOnScreen(clipId: string, screenId?: string | null) {
    const triggerObj: TriggerClip = {
      id: clipId,
      targetScreen: screenId,
      repeatX: 0,  // todo after streamdeck ?
      repeatSecond: 0,
    }

    this.ws.send(`TRIGGER_CLIP=${JSON.stringify(triggerObj)}`);
  }
}
