import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebsocketHandler} from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {ENDPOINTS, WEBSOCKET_PATHS} from "@memebox/contracts";
import {Observable, pipe, Subject} from "rxjs";
import {filter, map, takeUntil} from "rxjs/operators";
import {AllTwitchEvents, TwitchEvent} from "../../../../../server/providers/twitch/twitch.connector.types";
import {isBan, isChannelPointRedemption, isCheer, isGiftSub, isRaid, isSub} from './dashboard-overview.guards';
import {cacheSessionStorage, takeLatestItems} from "./dashboard-overview.rxjs-utils";
import {API_BASE} from "@memebox/app-state";
import {HttpClient} from "@angular/common/http";

// TODO extract a componentbase to use for _destroy$ or find some alternative

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

  public twitchEvents$: Observable<AllTwitchEvents[]>;

  constructor(
    private http: HttpClient
  ) {
    const twitchEventsAsArray = this.wsHandler.onMessage$.pipe(
      filter(str => !str.includes('"type":"message"')),
      map(str => JSON.parse(str) as AllTwitchEvents),
    );

    this.twitchEvents$ = twitchEventsAsArray.pipe(
      takeUntil(this._destroy$),
      cacheSessionStorage<AllTwitchEvents, AllTwitchEvents[]>('latestTwitchEvents', [],
        (loadedValues) => pipe(
          takeLatestItems(20, loadedValues)
        )
      ),
      map(items => [...items].reverse())
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

  isChannelPointRedemption = isChannelPointRedemption;
  isCheer = isCheer;
  isRaid = isRaid;
  isSub = isSub;
  isGiftSub = isGiftSub;
  isBan = isBan;

  replayEvent($event: MouseEvent, twitchEvent: TwitchEvent) {
    $event.stopImmediatePropagation();

    const newEvent: TwitchEvent = {
      ...twitchEvent,
      timestamp: new Date()
    }

    this.http.post(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS.PREFIX}${ENDPOINTS.TWITCH_EVENTS.TRIGGER_EVENT}`, newEvent)
      .toPromise();
  }
}
