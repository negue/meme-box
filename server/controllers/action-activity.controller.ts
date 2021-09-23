import {Controller, Get} from "@tsed/common";
import {ENDPOINTS} from "@memebox/contracts";
import {ActionActiveState, ActionStateEntries} from "../providers/actions/action-active-state";

@Controller(`/${ENDPOINTS.ACTION_ACTIVITY.PREFIX}`)
export class ActionActivityController {

  constructor(
    private actionState: ActionActiveState
  ) {
  }


  @Get(ENDPOINTS.ACTION_ACTIVITY.CURRENT)
  getCurrentState(): ActionStateEntries {
    return this.actionState.getState();
  }
}
