import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {ScreenActiveStatePayload, ScreenState} from "@memebox/contracts";

@Service()
export class ScreenActiveStateEventBus {
  private _allEvents$ = new Subject<ScreenState>();
  private state: ScreenState = {};

  public AllEvents$ = this._allEvents$.asObservable();

  public updateScreenState(payload: ScreenActiveStatePayload) {
    this.state[payload.screenId] = payload.state;

    this._allEvents$.next(this.state);
  }
}
