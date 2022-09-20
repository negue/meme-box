import {Injectable} from "@angular/core";
import {WebsocketHandler} from "./websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {ErrorWithContext, WEBSOCKET_PATHS} from "@memebox/contracts";
import {map, shareReplay} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ErrorsService {
  private errorWS = new WebsocketHandler(
    AppConfig.wsBase + WEBSOCKET_PATHS.ERRORS,
    3000
  );

  public latestErrorList$ = this.errorWS.onMessage$.pipe(
    map(jsonArray => JSON.parse(jsonArray) as ErrorWithContext[]),
    shareReplay(1)
  );

  constructor(
  ) {
  }

  listenToBackendsErrors() {
    this.errorWS.connect();
  }
}
