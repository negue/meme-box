import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {ActionActiveStatePayload} from "@memebox/contracts";

@Service()
export class ActionActiveStateEventBus {
  private _allEvents$ = new Subject<ActionActiveStatePayload>();

  public AllEvents$ = this._allEvents$.asObservable();

  public updateActionState(payload: ActionActiveStatePayload) {
    this._allEvents$.next(payload);
  }
}
