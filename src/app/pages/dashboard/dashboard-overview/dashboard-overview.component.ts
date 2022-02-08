import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebsocketHandler} from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {WEBSOCKET_PATHS} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

// TODO extract a componentbase to use for _destroy$ or find some alternative

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss']
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {

  private connectionStateWS = new WebsocketHandler(
    AppConfig.wsBase + WEBSOCKET_PATHS.CONNECTIONS_STATE,
    3000
  );


  public connectionState$: Observable<unknown>;

  constructor() {
    this.connectionState$ = this.connectionStateWS.onMessage$.asObservable().pipe(
      map(str => Object.values(JSON.parse(str))),
    );
  }

  ngOnInit(): void {
    this.connectionStateWS.connect();
  }

  ngOnDestroy(): void {
    this.connectionStateWS.stopReconnects();
  }

}
