import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {AllTwitchEvents} from "@memebox/contracts";

@Service()
export class TwitchQueueEventBus {
  private _allTriggerEvents$ = new Subject<AllTwitchEvents>();

  public AllQueuedEvents$ = this._allTriggerEvents$.asObservable();

  public queueEvent(triggerClip: AllTwitchEvents): void  {
    this._allTriggerEvents$.next(triggerClip);
  }
}
