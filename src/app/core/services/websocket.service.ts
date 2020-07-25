import {Injectable} from '@angular/core';
import {WS_PORT} from "../../../../server/constants";
import {TriggerClip} from "@memebox/contracts";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private ws: WebSocket;

  constructor() {

    this.ws = new WebSocket(`ws://${location.hostname}:${WS_PORT}`);
  }

  public triggerClipOnScreen(clipId: string, screenId?: string|null) {
    const triggerObj: TriggerClip = {
      id: clipId,
      targetScreen: screenId,
      repeatX: 0,  // todo after streamdeck ?
      repeatSecond: 0,
    }

    this.ws.send(`TRIGGER_CLIP=${JSON.stringify(triggerObj)}`);
  }
}
