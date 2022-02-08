import {Component, OnDestroy, OnInit} from '@angular/core';
import {AllTwitchEvents, ENDPOINTS, TwitchEvent, WEBSOCKET_PATHS} from "@memebox/contracts";
import {API_BASE} from "@memebox/app-state";
import {isBan, isChannelPointRedemption, isCheer, isGiftSub, isRaid, isSub} from './twitch.type-guards';
import {WebsocketHandler} from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {Observable} from "rxjs";
import {filter, map, startWith, switchMap} from "rxjs/operators";
import {takeLatestItems} from "@memebox/utils";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-latest-twitch-events',
  templateUrl: './latest-twitch-events.component.html',
  styleUrls: ['./latest-twitch-events.component.scss']
})
export class LatestTwitchEventsComponent implements OnInit, OnDestroy {
  private twitchEventWS = new WebsocketHandler(
    AppConfig.wsBase + WEBSOCKET_PATHS.TWITCH_EVENTS,
    3000
  );
  public twitchEvents$: Observable<AllTwitchEvents[]>;

  constructor(
    private http: HttpClient
  ) {

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

  ngOnInit(): void {
    this.twitchEventWS.connect();
  }

  ngOnDestroy(): void {
    this.twitchEventWS.stopReconnects();
  }
}
