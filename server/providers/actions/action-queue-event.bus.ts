import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {TriggerAction, TriggerActionUpdate} from "@memebox/contracts";

// UNTIL everything in the backend is refactored to TSED, we need some global instance
export let CURRENT_MEMEBOX_ACTION_QUEUE_EVENT_BUS: ActionQueueEventBus;


@Service()
export class ActionQueueEventBus {
  private _allTriggerEvents$ = new Subject<TriggerAction>();
  private _allUpdateEvents$ = new Subject<TriggerActionUpdate>();

  public AllQueuedActions$ = this._allTriggerEvents$.asObservable();
  public AllUpdateEvents$ = this._allUpdateEvents$.asObservable();

  constructor() {
    CURRENT_MEMEBOX_ACTION_QUEUE_EVENT_BUS = this;
  }


  public queueAction(triggerClip: TriggerAction): void  {
    this._allTriggerEvents$.next(triggerClip);
  }

  public updateActionProps(triggerClip: TriggerAction): void  {
    this._allUpdateEvents$.next(triggerClip);
  }
}
