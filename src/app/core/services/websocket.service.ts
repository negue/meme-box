import {Injectable} from '@angular/core';
import {ACTIONS, TriggerClip} from "@memebox/contracts";
import {Subject} from "rxjs";
import {AppConfig} from "@memebox/app/env";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public onOpenConnection$ = new Subject();
  public onUpdateData$ = new Subject();
  public onReloadScreen$ = new Subject();
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

    this.ws = new WebSocket(AppConfig.wsBase);

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
        case ACTIONS.TRIGGER_CLIP: {
          const payloadObj: TriggerClip = JSON.parse(payload);

          this.onTriggerClip$.next(payloadObj);

          break;
        }
        case ACTIONS.UPDATE_DATA: {
          this.onUpdateData$.next();
          break;
        }
        case ACTIONS.RELOAD_SCREEN: {
          this.onReloadScreen$.next();
          break;
        }
      }

    };
  }

  public sendI_Am_OBS(guid: string) {
    this.ws.send(`${ACTIONS.I_AM_OBS}=${guid}`);
  }


  public triggerClipOnScreen(clipId: string, screenId?: string | null) {
    const triggerObj: TriggerClip = {
      id: clipId,
      targetScreen: screenId,
      repeatX: 0,  // todo after streamdeck ?
      repeatSecond: 0,
    }

    this.ws.send(`${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(triggerObj)}`);
  }

  public reloadScreen(screenId: string | null) {
    this.ws.send(`${ACTIONS.RELOAD_SCREEN}=${screenId}`);
  }
}
