import {DisposableBase} from "./disposableBase";
import {Observable, Subject} from "rxjs";
import {filter, takeUntil} from "rxjs/operators";

export interface EventBusMessage {
  type: string;
  payload: unknown;
}

export class EventBusApi extends DisposableBase {
  // TODO extract - if needed accessible outside of this EventBusApi
  private static eventBus$ = new Subject<EventBusMessage>();

  constructor() {
    super();
  }

  public send(type: string, payload: unknown): void {
    // check if full eventbus message is serializable
    const serializedMessage = JSON.stringify({
      type,
      payload
    });

    EventBusApi.eventBus$.next(JSON.parse(serializedMessage));
  }

  public on$(eventTypesToSubscribe: string|string[]): Observable<EventBusMessage> {
    if (!Array.isArray(eventTypesToSubscribe)) {
      eventTypesToSubscribe = [eventTypesToSubscribe];
    }

    if (!eventTypesToSubscribe.every(s => typeof s === 'string')) {
      throw new Error('eventBus.on$ needs be an array of strings');
    }

    return EventBusApi.eventBus$.pipe(
      filter(message => eventTypesToSubscribe.includes(message.type)),
      takeUntil(this._destroy$)
    );
  }
}
