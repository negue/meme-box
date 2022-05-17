import {Service} from "@tsed/di";
import {ActionActiveStateEventBus} from "./action-active-state-event.bus";
import {filter, map, take, withLatestFrom} from "rxjs/operators";
import {ActionActiveStatePayload, ActionStateEnum} from "@memebox/contracts";
import {
  ActionStateEntries,
  isActionCurrently,
  resetActivityForScreenId,
  updateActivityInState
} from "@memebox/shared-state";
import {ScreenActiveStateEventBus} from "../screens/screen-active-state-event.bus";
import {BehaviorSubject, Subject} from "rxjs";
import cloneDeep from "lodash/cloneDeep"

interface ActionActivityEvent {
  type: 'action-activity';
  payload: ActionActiveStatePayload;
}

interface ScreenIsHiddenEvent {
  type: 'screen-is-hidden';
  screenId: string;
}

type ActionActiveStateEvents = ActionActivityEvent|ScreenIsHiddenEvent;

@Service()
export class ActionActiveState {
  // actionId   -> actionId/screenId --> visible state
  private _state$ = new BehaviorSubject<ActionStateEntries>({});
  private _events$ = new Subject<ActionActiveStateEvents>();

  constructor(
    private mediaStateEventBus: ActionActiveStateEventBus,
    private screenStateEventBus: ScreenActiveStateEventBus
  ) {
    this._events$
      .pipe(
        withLatestFrom(this._state$)
      )
      .subscribe(([event, currentState]) => {
        switch (event.type) {
          case 'action-activity': {
            updateActivityInState(currentState, event.payload)

            break;
          }
          case 'screen-is-hidden': {
            resetActivityForScreenId(currentState, event.screenId);

            break;
          }
        }

        this._state$.next(currentState);
      });

    this.subscribeForActions();
  }

  public getState (): Readonly<ActionStateEntries> {
    return Object.freeze(cloneDeep(this._state$.value));
  }

  public isCurrently (activeState: ActionStateEnum, actionId: string, screenId?: string) {
    return isActionCurrently(this.getState(), activeState, actionId, screenId)
  }

  public waitUntilDoneAsync(mediaId: string, screenId?: string): Promise<void> {
    if (!this.isCurrently(ActionStateEnum.Active, mediaId, screenId)
    && !this.isCurrently(ActionStateEnum.Triggered, mediaId, screenId)) {

      return Promise.resolve();
    }

    return this._state$
    .pipe(
      filter(( state) => {
        const mediaObject = state[mediaId];

        return mediaObject[screenId ?? mediaId] === ActionStateEnum.Done;
      }),
      map(_ => {}),
      take(1)
    ).toPromise();

    /** Other Ideas ?
     - [ ] if media is only in one screen => ok
     - [ ] if media in multiple screens
     - [ ] accept the first "done"event and done
     - [ ] wait until of them are done
     - [ ] a specific one is done
     */
  }

  private subscribeForActions() {
    this.mediaStateEventBus.AllEvents$
      .subscribe((event) => {
        this._events$.next({
          type: 'action-activity',
          payload: event
        });
      });

    this.screenStateEventBus.AllEvents$
      .subscribe(event => {
        for (const [screenId, isVisible] of Object.entries(event)) {
          if (!isVisible) {
            this._events$.next({
              type: 'screen-is-hidden',
              screenId: screenId
            });
          }
        }
      })
  }
}
