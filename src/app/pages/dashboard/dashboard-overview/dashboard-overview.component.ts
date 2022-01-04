import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebsocketHandler} from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {ENDPOINTS, WEBSOCKET_PATHS} from "@memebox/contracts";
import {Observable, Subject} from "rxjs";
import { filter, map, startWith, switchMap, takeUntil, tap } from "rxjs/operators";
import {AllTwitchEvents, TwitchEvent} from "../../../../../server/providers/twitch/twitch.connector.types";
import {isBan, isChannelPointRedemption, isCheer, isGiftSub, isRaid, isSub} from './dashboard-overview.guards';
import {API_BASE} from "@memebox/app-state";
import {HttpClient} from "@angular/common/http";
import { takeLatestItems } from "../../../../../projects/utils/src/lib/rxjs";

// TODO extract a componentbase to use for _destroy$ or find some alternative

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss']
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private twitchEventWS = new WebsocketHandler(
    AppConfig.wsBase + WEBSOCKET_PATHS.TWITCH_EVENTS,
    3000
  );

  private connectionStateWS = new WebsocketHandler(
    AppConfig.wsBase + WEBSOCKET_PATHS.CONNECTIONS_STATE,
    3000
  );

  public twitchEvents$: Observable<AllTwitchEvents[]>;
  public connectionState$: Observable<unknown>;

  constructor(
    private http: HttpClient,
  ) {
    this.connectionState$ = this.connectionStateWS.onMessage$.asObservable().pipe(
      map(str => Object.values(JSON.parse(str))),
    );

    const twitchEventByWS$ = this.twitchEventWS.onMessage$.pipe(
      filter(str => !str.includes('"type":"message"')),
      map(str => JSON.parse(str) as AllTwitchEvents),
    );

    const latest20Events$ = this.http.get<AllTwitchEvents[]>(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS.PREFIX}${ENDPOINTS.TWITCH_EVENTS.LAST_20_EVENTS}`);

    this.twitchEvents$ = latest20Events$.pipe(
      switchMap(latest20 =>
        twitchEventByWS$.pipe(
          takeLatestItems(20, latest20),
          startWith(latest20),
          map(items => [...items].reverse())
        )
      ),
    );
  }

  ngOnInit(): void {
    this.connectionStateWS.connect();
  }

  ngOnDestroy(): void {
    this.connectionStateWS.stopReconnects();
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
