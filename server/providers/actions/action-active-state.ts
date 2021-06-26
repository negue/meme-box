import {Service} from "@tsed/di";
import {ActionActiveStateEventBus} from "./action-active-state-event.bus";
import {filter, map, take} from "rxjs/operators";
import {ActionStateEnum} from "@memebox/contracts";


type ActionStateEntries = Record<string, Record<string, ActionStateEnum>>;

@Service()
export class ActionActiveState {
  // mediaId   -> screenId --> visible state
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

  public waitUntilDoneAsync(mediaId: string, screenId?: string): Promise<void> {
    console.info('Created a waitUntilDoneAsync - ', mediaId);

    // TODO ONCE SCREEN STATE is avilable check if the target screen is visible / opened

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
