import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ConnectionStateService {
  private offlineMode$ = new BehaviorSubject<boolean>(false);

  public setOfflineMode(value: boolean) {
    this.offlineMode$.next(value);
  }

  public isOffline() {
    return this.offlineMode$.value;
  }

  public isOffline$() {
    return this.offlineMode$.asObservable();
  }
}
