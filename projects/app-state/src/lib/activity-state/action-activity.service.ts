import {Injectable} from '@angular/core';
import {ActivityStore} from './activity.store';
import {HttpClient} from '@angular/common/http';
import {ActionActiveStatePayload, ENDPOINTS, ScreenState, WEBSOCKET_PATHS} from "@memebox/contracts";
import {take} from "rxjs/operators";
import {API_BASE} from "@memebox/app-state";
import {ActionStateEntries, updateActivityInState} from "@memebox/shared-state";
import {WebsocketHandler} from "../services/websocket.handler";
import {AppConfig} from "@memebox/app/env";

@Injectable({
  providedIn: 'root'
})
export class ActionActivityService {

  constructor(private activityStore: ActivityStore,
              public http: HttpClient,  // todo extract http client and api_url base including the offline checks
  ) {
    // Load State once
    this.http.get<ActionStateEntries>(`${API_BASE}${ENDPOINTS.ACTION_ACTIVITY.PREFIX}${ENDPOINTS.ACTION_ACTIVITY.CURRENT}`).pipe(
      take(1)
    ).subscribe(value => {
      this.activityStore.update(() => value);
    });

    const actionStateWSHandler = new WebsocketHandler(
      AppConfig.wsBase + WEBSOCKET_PATHS.ACTION_ACTIVITY,
      3000
    );

    actionStateWSHandler.connect();

    // Subscribe to Websocket Updates
    actionStateWSHandler.onMessage$.pipe(
      //  takeUntil(this._destroy$)
    ).subscribe((activityUpdateJson) => {
      const activityUpdate = JSON.parse(activityUpdateJson) as ActionActiveStatePayload;

      this.activityStore.update(currentState => {
        updateActivityInState(currentState.actionState, activityUpdate)
      });
    });


    const screenStateWSHandler = new WebsocketHandler(
      AppConfig.wsBase + WEBSOCKET_PATHS.SCREEN_ACTIVITY,
      3000
    );

    screenStateWSHandler.connect();

    // Subscribe to Websocket Updates
    screenStateWSHandler.onMessage$.pipe(
      //  takeUntil(this._destroy$)
    ).subscribe((activityUpdateJson) => {
      const activityUpdate = JSON.parse(activityUpdateJson) as ScreenState;

      this.activityStore.update(currentState => {
        currentState.screenState = activityUpdate;
      });
    });
  }
}

