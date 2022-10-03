import {Injectable} from '@angular/core';
import {ActivityStore} from './activity.store';
import {ActionActiveStatePayload, ENDPOINTS, ScreenState, WEBSOCKET_PATHS} from "@memebox/contracts";
import {ActionStateEntries, updateActivityInState} from "@memebox/shared-state";
import {WebsocketHandler} from "../services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {MemeboxApiService} from "../state/memeboxApi.service";

@Injectable({
  providedIn: 'root'
})
export class ActionActivityService {

  constructor(private activityStore: ActivityStore,
              private memeboxApi: MemeboxApiService,
  ) {
    // Load State once
    this.memeboxApi.get<ActionStateEntries>(`${ENDPOINTS.ACTION_ACTIVITY.PREFIX}${ENDPOINTS.ACTION_ACTIVITY.CURRENT}`)
      .then( actionStateInitialValue => {
        this.activityStore.update((currentState) =>
        {
          return {
            actionState: {
              ...currentState.actionState,
              ...actionStateInitialValue,
            },
            screenState: currentState.screenState
          }
        });
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

