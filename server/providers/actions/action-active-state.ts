import {Service} from "@tsed/di";
import {ActionActiveStateEventBus} from "./action-active-state-event.bus";
import {filter, map, take} from "rxjs/operators";

type MediaVisibilityStateType = Record<string, Record<string, boolean>>;

@Service()
export class ActionActiveState {
  // mediaId   -> screenId --> visible state
  private state: MediaVisibilityStateType = {};

  constructor(
    private mediaStateEventBus: ActionActiveStateEventBus
  ) {
    mediaStateEventBus.AllEvents$.subscribe(
      value => {
        if (!this.state[value.mediaId]) {
          this.state[value.mediaId] = {};
        }

        this.state[value.mediaId][value.screenId ?? value.mediaId] = value.active;
      }
    )
  }

  // todo real readonly
  public getState (): Readonly<MediaVisibilityStateType> {
    return {
      ...this.state
    }
  }

  public waitUntilDoneAsync(mediaId: string, screenId?: string): Promise<void> {
    console.info('Created a waitUntilDoneAsync - ', mediaId);

    // first try
    return this.mediaStateEventBus.AllEvents$.pipe(
      filter(e => {
        console.info('current event', e);

        if (e.mediaId !== mediaId) {
          return false;
        }

        if (screenId && screenId !== e.screenId) {
          return false;
        }

        return e.active === false;
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
