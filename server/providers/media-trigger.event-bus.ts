import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {TriggerClip} from "@memebox/contracts";

// UNTIL everything in the backend is refactored to TSED, we need some global instance
export let CURRENT_MEMEBOX_MEDIATRIGGER_EVENT_BUS: MediaTriggerEventBus;


@Service()
export class MediaTriggerEventBus {
  private _allEvents$ = new Subject<TriggerClip>();

  public AllEvents$ = this._allEvents$.asObservable();

  constructor() {
    CURRENT_MEMEBOX_MEDIATRIGGER_EVENT_BUS = this;
  }


  public triggerMedia(triggerClip: TriggerClip) {
    this._allEvents$.next(triggerClip);
  }
}
