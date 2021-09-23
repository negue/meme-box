import {Service} from "@tsed/di";
import {ActionActiveStateEventBus} from "./action-active-state-event.bus";
import {filter, map, take} from "rxjs/operators";
import {ActionStateEnum} from "@memebox/contracts";


export type ActionStateEntries = Record<string, Record<string, ActionStateEnum>>;

@Service()
export class ActionActiveState {
  // actionId   -> actionId/screenId --> visible state
  private state: ActionStateEntries = {};

  constructor(
    private mediaStateEventBus: ActionActiveStateEventBus
  ) {
    mediaStateEventBus.AllEvents$.subscribe(
      value => {
        if (!this.state[value.mediaId]) {
          this.state[value.mediaId] = {};
        }

        this.state[value.mediaId][value.screenId ?? value.mediaId] = value.state;
      }
    )
  }

  // todo real readonly
  public getState (): Readonly<ActionStateEntries> {
    return {
      ...this.state
    }
  }

  public isCurrently (activeState: ActionStateEnum, mediaId: string, screenId?: string) {
    const mediaInState = this.state[mediaId];

    if (!mediaInState) {
      return false;
    }

    if (screenId) {
      const screenExists = mediaInState[screenId];

      if (!screenExists) {
        return false;
      }

      return screenExists === activeState;
    }

    const values = Object.values(mediaInState)

    if (values.length === 0) {
      return false;
    }

    return values.includes(activeState);
  }

  public waitUntilDoneAsync(mediaId: string, screenId?: string): Promise<void> {
    if (!this.isCurrently(ActionStateEnum.Active, mediaId, screenId)
    && !this.isCurrently(ActionStateEnum.Triggered, mediaId, screenId)) {

      return Promise.resolve();
    }

    console.info('Created a waitUntilDoneAsync - ', mediaId);

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
