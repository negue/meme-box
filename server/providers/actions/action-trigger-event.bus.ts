import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {TriggerAction, TriggerActionUpdate} from "@memebox/contracts";

// UNTIL everything in the backend is refactored to TSED, we need some global instance
export let CURRENT_MEMEBOX_MEDIATRIGGER_EVENT_BUS: ActionTriggerEventBus;


@Service()
export class ActionTriggerEventBus {
  private _allTriggerEvents$ = new Subject<TriggerAction>();
  private _allUpdateEvents$ = new Subject<TriggerActionUpdate>();

  public AllTriggerEvents$ = this._allTriggerEvents$.asObservable();
  public AllUpdateEvents$ = this._allUpdateEvents$.asObservable();

  constructor() {
    CURRENT_MEMEBOX_MEDIATRIGGER_EVENT_BUS = this;
  }


  public triggerMedia(triggerClip: TriggerAction) {
    this._allTriggerEvents$.next(triggerClip);
  }
}
