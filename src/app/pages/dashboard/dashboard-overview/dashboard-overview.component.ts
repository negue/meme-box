import {Component, OnDestroy, OnInit} from '@angular/core';
import {WebsocketHandler} from "../../../../../projects/app-state/src/lib/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {ENDPOINTS, ObsBrowserSourceData, Screen, StateOfAService, WEBSOCKET_PATHS} from "@memebox/contracts";
import {combineLatest, Observable} from "rxjs";
import {debounceTime, map} from "rxjs/operators";
import {ActivityQueries, AppQueries, MemeboxApiService, ObsService, SnackbarService} from "@memebox/app-state";
import {fromPromise} from "rxjs/internal-compatibility";


// TODO extract a componentbase to use for _destroy$ or find some alternative

interface ScreenInOBS {
  screenData: Screen;
  connected: boolean;
  correctPort: boolean;
  correctResolution: boolean;
  obsData: ObsBrowserSourceData;
  statusString: string;
  warnFPS: boolean;
  fps: string;
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

  public screensInOBS$: Observable<ScreenInOBS[]>;

  constructor(
    private memeboxApi: MemeboxApiService,
    private memeboxObsApi: ObsService,
    private appQuery: AppQueries,
    private activityState: ActivityQueries,
    private snackbar: SnackbarService,
  ) {
    this.connectionState$ = this.connectionStateWS.onMessage$.asObservable().pipe(
      map(str => Object.values(JSON.parse(str))),
    );

    const loadedObsBrowsersource =  this.memeboxApi.get<ObsBrowserSourceData[]>(`${ENDPOINTS.OBS_DATA.PREFIX}${ENDPOINTS.OBS_DATA.CURRENT_BROWSER_SOURCES}`);
    this.screensInOBS$ = combineLatest([
      fromPromise(loadedObsBrowsersource),
      this.appQuery.screensList$,
      activityState.state$
    ]).pipe(
      debounceTime(150),
      map(([obsBrowserSources, allScreens, activityState]) => {
        return obsBrowserSources.map(browserSource => {
          const url = browserSource.sourceSettings['url'] + '';
          const foundScreen = allScreens.find(screen => url.includes(screen.id));

          if (!foundScreen) {
            return null;
          }

          const correctResolution = foundScreen.width === browserSource.sourceSettings['width']
          && foundScreen.height === browserSource.sourceSettings['height'];

          const fps = browserSource.sourceSettings["fps"];
          const warnFPS = Number(fps) < 60;

          const correctPort = url.includes(AppConfig.port + '');

          const connected = activityState.screenState[foundScreen.id];

          let statusString = '';

          if (!correctPort) {
            statusString = 'Not using the Memebox-Port';
          } else if (!connected) {
            statusString = 'Browser Source is not connected to Memebox (try refreshing)';
          } else if (!correctResolution) {
            statusString = 'The Browser Source in OBS has a different resolution';
          } else if (!warnFPS) {
            statusString = `The Browser Source FPS Setting might be too slow. (${fps})`;
          } else {
            statusString = 'Ok!'
          }

          return {
            screenData: foundScreen,
            correctPort,
            correctResolution,
            connected,
            obsData: browserSource,
            statusString,
            warnFPS,
            fps
          } as ScreenInOBS;
        }).filter(bs => !!bs);
      })
    );

    // browserSource.sourceName
    // browserSource.sourceSettings
    // - fps
    // - fps_custom
    // - height
    // - width
    // - url
  }

  ngOnInit(): void {
    this.connectionStateWS.connect();
  }

  ngOnDestroy(): void {
    this.connectionStateWS.stopReconnects();
  }

  triggerObsReload(screenInOBS: ScreenInOBS) {
    this.memeboxObsApi.triggerReloadObsScreen(screenInOBS.obsData.sourceName);
    this.snackbar.normal(`Screen: ${screenInOBS.screenData.name} reloaded`);
  }
}
