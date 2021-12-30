import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebsocketHandler} from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {WEBSOCKET_PATHS} from "@memebox/contracts";
import {Observable, pipe, Subject} from "rxjs";
import {filter, map, scan, takeUntil} from "rxjs/operators";

// TODO extract a componentbase to use for _destroy$ or find some alternative

function takeLatestItems<T>(amount: number) {
  return pipe(
    scan((acc, val: T) => {
      acc.push(val);
      return acc.slice(-amount);
    }, [] as T[])
  )
}

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss']
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private wsHandler = new WebsocketHandler(
    AppConfig.wsBase + WEBSOCKET_PATHS.TWITCH_EVENTS,
    3000
  );

  public twitchEvents$: Observable<string[]>;

  constructor() {
    this.twitchEvents$ = this.wsHandler.onMessage$.pipe(
      takeUntil(this._destroy$),
      filter(str => !str.includes('"type":"message"')),
      map(str => JSON.parse(str)),
      takeLatestItems(2)
    );

  }

  ngOnInit(): void {


    this.wsHandler.connect();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();

    this.wsHandler.stopReconnects();
  }

}
