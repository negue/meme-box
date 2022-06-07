import { Service } from "@tsed/di";
import { ActionActiveStateEventBus } from "./action-active-state-event.bus";
import { TriggerActionOverrides } from "../../../projects/contracts/src/lib/actions";

@Service()
export class ActionVariableState {
  private currentActionOverrides: {[actionId: string]: TriggerActionOverrides} = {};

  // null values ignored, which are happen on a done event
  private lastActionOverrides: {[actionId: string]: TriggerActionOverrides} = {};

  constructor (
    private _actionStateEventBus: ActionActiveStateEventBus
  ) {
    _actionStateEventBus.AllEvents$.subscribe(value => {
      this.currentActionOverrides[value.mediaId] = value.overrides;

      if (value.overrides) {
        this.lastActionOverrides[value.mediaId] = value.overrides;
      }
    })
  }

  getCurrentActionOverrides(actionId: string): TriggerActionOverrides {
    return this.currentActionOverrides[actionId];
  }

  getLastActionOverrides(actionId: string): TriggerActionOverrides {
    return this.lastActionOverrides[actionId];
  }

}
