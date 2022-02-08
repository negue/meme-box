import {WebsocketHandler} from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import {AllTwitchEvents, TriggerAction, TwitchEventTypes} from "@memebox/contracts";
import {Subject, Subscription} from "rxjs";
import {ActionStoreAdapter, ActionStoreApi} from "@memebox/shared-state";

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

type TriggeredEventCallback = (currentTriggeredPayload: TriggerAction) => void;

export class WidgetApi {
  public twitch: WidgetTwitchApi;
  public store: ActionStoreApi;
  private triggeredCallback: TriggeredEventCallback;

  constructor (
    mediaId: string,
    instanceId: string,
    storeAdapter: ActionStoreAdapter,
    private websocketHandler: WebsocketHandler,
    private _errorSubject$: Subject<string>
  ) {
    this.twitch = new WidgetTwitchApi(websocketHandler, _errorSubject$);
    this.store = new ActionStoreApi(mediaId, instanceId, storeAdapter, _errorSubject$);
  }

  public triggered(callback: TriggeredEventCallback) {
    this.triggeredCallback = callback;
  }

  dispose() {
    this.twitch.dispose();
  }

  triggerIsShown(currentTriggeredPayload: TriggerAction) {
    if (this.triggeredCallback) {
      try {
        console.info({currentTriggeredPayload});
        this.triggeredCallback(currentTriggeredPayload);
      } catch (e) {
        this._errorSubject$.next(e);
      }
    }
  }

  isReady(): Promise<boolean> {
    // todo twitch api "ready"
    return this.store.ready();
  }
}
