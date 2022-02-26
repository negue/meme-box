import {ActionStateEntries} from "@memebox/shared-state";
import {ScreenState} from "@memebox/contracts";

export interface ActivityState {
  actionState: ActionStateEntries;
  screenState: ScreenState
}
