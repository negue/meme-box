import {WebsocketHandler} from "../../../core/services/websocket.handler";
import {TwitchEventTypes} from "@memebox/contracts";
import {AllTwitchEvents} from "../../../../../server/providers/twitch/twitch.connector.types";
import {Subscription} from "rxjs";

type TwitchEventCallback = (twitchEvent: AllTwitchEvents) => void;

export class WidgetTwitchApi {
  // Map between each type => callback
  private callbackMap = new Map<string, TwitchEventCallback>();
  private subscription: Subscription;

  constructor(private websocketHandler: WebsocketHandler) {
    this.subscription = this.websocketHandler.onMessage$
      .subscribe(twitchEventRaw => {
        const twitchEvent: AllTwitchEvents = JSON.parse(twitchEventRaw)
        const twitchEventType = twitchEvent.type;

        if (this.callbackMap.has(twitchEventType)) {
          const callbackFunc = this.callbackMap.get(twitchEventType);
          callbackFunc(twitchEvent);
        }

        if (this.callbackMap.has('*')) {
          const callbackFunc = this.callbackMap.get('*');
          callbackFunc(twitchEvent);
        }
      });
  }

  on(
    eventType: TwitchEventTypes|'*',
     callback: TwitchEventCallback
  ) {
    this.callbackMap.set(eventType, callback);
  }

  dispose() {
    this.callbackMap.clear();
    this.subscription.unsubscribe();
  }
}

export class WidgetApi {
  public twitch: WidgetTwitchApi;

  constructor(private websocketHandler: WebsocketHandler) {
    this.twitch = new WidgetTwitchApi(websocketHandler);
  }


  dispose() {
    this.twitch.dispose();
  }
}
