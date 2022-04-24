import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {ActionActiveStatePayload} from "@memebox/contracts";

@Service()
export class ActionActiveStateEventBus {
  private _allEvents$ = new Subject<ActionActiveStatePayload>();

  public AllEvents$ = this._allEvents$.asObservable();

  // todo refactor use the TriggerAction Payload instead , including the target State-Enum Value
  public updateActionState(payload: ActionActiveStatePayload): void  {
    this._allEvents$.next(payload);
  }
}
