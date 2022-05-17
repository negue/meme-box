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

  // TODO refactor publish these to the WS, so that the client can use those
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

  public getActiveStateEntry(actionId: string, screenId?: string) {
    const state = this.getState();

    return state[actionId]?.[screenId];
  }

  public isCurrently (activeState: ActionStateEnum, actionId: string, screenId?: string) {
    return isActionCurrently(this.getState(), activeState, actionId, screenId)
  }

  public waitUntilActiveAsync(actionId: string, screenId?: string): Promise<void> {
    if (this.isCurrently(ActionStateEnum.Active, actionId, screenId)) {
      return Promise.resolve();
    }

    return this._state$
      .pipe(
        filter(( state) => {
          return isActionCurrently(state, ActionStateEnum.Active, actionId, screenId ?? actionId);
        }),
        map(_ => {}),
        take(1)
      ).toPromise();
  }

  public waitUntilDoneAsync(actionId: string, screenId?: string): Promise<void> {
    if (!this.isCurrently(ActionStateEnum.Active, actionId, screenId)
    && !this.isCurrently(ActionStateEnum.Triggered, actionId, screenId)) {
      return Promise.resolve();
    }

    return this._state$
    .pipe(
      filter(( state) => {
        const done = isActionCurrently(state, ActionStateEnum.Done, actionId, screenId ?? actionId);

        return done;
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
