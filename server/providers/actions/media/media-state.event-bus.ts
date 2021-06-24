import {Service} from "@tsed/di";
import {Subject} from "rxjs";
import {MediaStatePayload} from "@memebox/contracts";

@Service()
export class MediaStateEventBus {
  private _allEvents$ = new Subject<MediaStatePayload>();

  public AllEvents$ = this._allEvents$.asObservable();

  public updateMediaState(payload: MediaStatePayload) {
    this._allEvents$.next(payload);
  }
}
