import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebsocketHandler} from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {StateOfAService, WEBSOCKET_PATHS} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

// TODO extract a componentbase to use for _destroy$ or find some alternative

interface ScreenInOBS {
  screenId: string;
  connected: boolean;
  correctPort: boolean;
  correctResolution: boolean;
}

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


  public connectionState$: Observable<StateOfAService[]>;

  public screensInOBS: Observable<ScreenInOBS[]>;

  constructor() {
    this.connectionState$ = this.connectionStateWS.onMessage$.asObservable().pipe(
      map(str => Object.values(JSON.parse(str))),
    );

    // browserSource.sourceName
    // browserSource.sourceSettings
    // - fps
    // - height
    // - width
    // - url

    /*
    {"message-id":"2","sourceName":"Browser","sourceSettings":{"css":"",
    "fps":30,
    "fps_custom":false,
    "height":600,
    "reroute_audio":false,
    "restart_when_active":false,
    "shutdown":false,
    "url":"https://obsproject.com/browser-source",
    webpage_control_level":1,
    "width":800},"sourceType":"browser_source","status":"ok","messageId":"2"}
     */
  }

  ngOnInit(): void {
    this.connectionStateWS.connect();
  }

  ngOnDestroy(): void {
    this.connectionStateWS.stopReconnects();
  }

}
