import {WebsocketHandler} from "../../../core/services/websocket.handler";
import {TriggerClip, TwitchEventTypes} from "@memebox/contracts";
import {AllTwitchEvents} from "../../../../../server/providers/twitch/twitch.connector.types";
import {BehaviorSubject, Subscription} from "rxjs";
import {debounceTime, skip} from "rxjs/operators";

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

/**
 * TODO
 1. API on the Client-Side
 => local mememory  - done
 => asserts

 2. API on the Server-Side
 => endpoints
 => we need a custom place to save these informations (outside of the settings.json)
 => client: load the current state from Server API
 => client: "update" call to the Server API

 3. "maybe" some kind of race-condition safety
 => browser instance ID
 => will be used to prevent updates on the widget states

 4. widget store preview?
 */

type WidgetStore = Record<string, string|number|object>;

class WidgetStoreApi {
  private _state: WidgetStore = {};
  private _state$ = new BehaviorSubject<WidgetStore>({});
  private _state$$: Subscription;

  constructor() {
    // Load the Current State from API
    // MediaID
    this._state$$ = this._state$
      .pipe(
        skip(1),  // this is current state loaded once from API
        debounceTime(1500)
      )
      .subscribe(newStore => {
        // TODO push to the api
      })
  }

  public getString(key: string, defaultValue: string): string {
    const value = this._state[key];

    if (typeof value === 'string') {
      return value;
    }

    return defaultValue;
  }

  public setString(key: string, value: any) {
    this._state[key] = value;

    this.updateObservable();
  }


  public getNumber(key: string, defaultValue: number): number {
    const value = this._state[key];

    if (typeof value === 'number') {
      return value;
    }

    return defaultValue;
  }

  public setNumber(key: string, value: any) {
    this._state[key] = value;

    this.updateObservable();
  }

  public getObject(key: string, defaultValue: object): object {
    const value = this._state[key];

    if (typeof value === 'object') {
      return value ?? defaultValue;
    }

    return defaultValue;
  }

  public setObject(key: string, value: any) {
    this._state[key] = value;

    this.updateObservable();
  }

  dispose() {
    this._state$$.unsubscribe();
  }

  private updateObservable() {
    this._state$.next(this._state);
  }
}

type TriggeredEventCallback = (currentTriggeredPayload: TriggerClip) => void;

export class WidgetApi {
  public twitch: WidgetTwitchApi;
  public store: WidgetStoreApi;
  private triggeredCallback: TriggeredEventCallback;

  constructor(private websocketHandler: WebsocketHandler) {
    this.twitch = new WidgetTwitchApi(websocketHandler);
    this.store = new WidgetStoreApi();
  }

  public triggered(callback: TriggeredEventCallback) {
    this.triggeredCallback = callback;
  }

  dispose() {
    this.twitch.dispose();
  }

  triggerIsShown(currentTriggeredPayload: TriggerClip) {
    if (this.triggeredCallback) {
      console.info({currentTriggeredPayload});
      this.triggeredCallback(currentTriggeredPayload);
    }
  }
}
