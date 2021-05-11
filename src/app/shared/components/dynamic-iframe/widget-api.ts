import {WebsocketHandler} from "../../../core/services/websocket.handler";
import {TriggerClip, TwitchEventTypes} from "@memebox/contracts";
import {AllTwitchEvents} from "../../../../../server/providers/twitch/twitch.connector.types";
import {BehaviorSubject, Subject, Subscription} from "rxjs";
import {debounceTime, skip, take} from "rxjs/operators";
import {API_BASE, AppService} from "../../../state/app.service";

type TwitchEventCallback = (twitchEvent: AllTwitchEvents) => void;

export class WidgetTwitchApi {
  // Map between each type => callback
  private callbackMap = new Map<string, TwitchEventCallback>();
  private subscription: Subscription;

  constructor(private websocketHandler: WebsocketHandler,
              private _errorSubject$: Subject<string>) {
    this.subscription = this.websocketHandler.onMessage$
      .subscribe(twitchEventRaw => {
        const twitchEvent: AllTwitchEvents = JSON.parse(twitchEventRaw)
        const twitchEventType = twitchEvent.type;

        if (this.callbackMap.has(twitchEventType)) {
          try{
          const callbackFunc = this.callbackMap.get(twitchEventType);
          callbackFunc(twitchEvent);
          } catch (e) {
            this._errorSubject$.next(e);
          }
        }

        if (this.callbackMap.has('*')) {
          try {
            const callbackFunc = this.callbackMap.get('*');
            callbackFunc(twitchEvent);
          } catch (e) {
            this._errorSubject$.next(e);
          }
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

  constructor(
    private mediaId: string,
    private instanceId: string,
    private appService: AppService,
    private _errorSubject$: Subject<string>
  ) {
    this.appService.http.get<WidgetStore>(`${API_BASE}widget-state/${mediaId}`)
      .pipe(
        take(1)
      ).subscribe(value => {
        this._state = value;
        this._state$.next(value);
    });

    // Load the Current State from API
    // MediaID
    this._state$$ = this._state$
      .pipe(
        skip(1),  // this is current state loaded once from API
        debounceTime(1500)
      )
      .subscribe(newStore => {
        this.appService.tryHttpPut(`${API_BASE}widget-state/${mediaId}/${instanceId}`, newStore);
      })
  }

  public getString(key: string, defaultValue: string): string {
    const value = this._state[key];

    if (typeof value === 'string') {
      return value;
    }

    return defaultValue;
  }

  public setString(key: string, value: unknown) {
    if (typeof value !== 'string') {
      this._errorSubject$.next(`The "${key}" value needs to be a string`);
      return;
    }

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

  public setNumber(key: string, value: unknown) {
    if (typeof value !== 'number') {
      this._errorSubject$.next(`The "${key}" value needs to be a number`);
      return;
    }

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

  public setObject(key: string, value: unknown) {
    if (typeof value !== 'object') {
      this._errorSubject$.next(`The "${key}" value needs to be an object`);
      return;
    }

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

  constructor (
    mediaId: string,
    instanceId: string,
    appService: AppService,
    private websocketHandler: WebsocketHandler,
    private _errorSubject$: Subject<string>
  ) {
    this.twitch = new WidgetTwitchApi(websocketHandler, _errorSubject$);
    this.store = new WidgetStoreApi(mediaId, instanceId, appService, _errorSubject$);
  }

  public triggered(callback: TriggeredEventCallback) {
    this.triggeredCallback = callback;
  }

  dispose() {
    this.twitch.dispose();
  }

  triggerIsShown(currentTriggeredPayload: TriggerClip) {
    if (this.triggeredCallback) {
      try {
        console.info({currentTriggeredPayload});
        this.triggeredCallback(currentTriggeredPayload);
      } catch (e) {
        this._errorSubject$.next(e);
      }
    }
  }
}
