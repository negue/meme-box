import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {TwitchEvent} from "@memebox/contracts";

@Service()
export class TwitchQueueEventBus {
  private _allTriggerEvents$ = new Subject<TwitchEvent>();

  public AllQueuedEvents$ = this._allTriggerEvents$.asObservable();

  public queueEvent(triggerClip: TwitchEvent) {
    this._allTriggerEvents$.next(triggerClip);
  }
}
