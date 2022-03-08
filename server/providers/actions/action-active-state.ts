import {Service} from "@tsed/di";
import {ActionActiveStateEventBus} from "./action-active-state-event.bus";
import {filter, map, take} from "rxjs/operators";
import {ActionStateEnum} from "@memebox/contracts";
import {ActionStateEntries, isActionCurrently, updateActivityInState} from "@memebox/shared-state";

@Service()
export class ActionActiveState {
  // actionId   -> actionId/screenId --> visible state
  private state: ActionStateEntries = {};

  constructor(
    private mediaStateEventBus: ActionActiveStateEventBus
  ) {
    mediaStateEventBus.AllEvents$.subscribe(
      value => {
        updateActivityInState(this.state, value)
      }
    )
  }

  // todo real readonly
  public getState (): Readonly<ActionStateEntries> {
    return {
      ...this.state
    }
  }

  public isCurrently (activeState: ActionStateEnum, actionId: string, screenId?: string) {
    return isActionCurrently(this.state, activeState, actionId, screenId)
  }

  public waitUntilDoneAsync(mediaId: string, screenId?: string): Promise<void> {
    if (!this.isCurrently(ActionStateEnum.Active, mediaId, screenId)
    && !this.isCurrently(ActionStateEnum.Triggered, mediaId, screenId)) {

      return Promise.resolve();
    }

    // first try
    return this.mediaStateEventBus.AllEvents$.pipe(
      filter(e => {
        if (e.mediaId !== mediaId) {
          return false;
        }

        if (screenId && screenId !== e.screenId) {
          return false;
        }

        return e.state === ActionStateEnum.Done;
      }),
      map(value => {}),
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
}
