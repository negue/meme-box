import {BodyParams, Controller, Get, Inject, PathParams, Post} from "@tsed/common";
import {
  ACTION_TYPE_INFORMATION,
  ActionType,
  ENDPOINTS,
  HasId,
  TriggerAction,
  TriggerActionDashboardEntry
} from "@memebox/contracts";
import {Persistence} from "../persistence";
import {PERSISTENCE_DI} from "../providers/contracts";
import {actionCanBeTriggeredWithVariables, getVariablesListOfAction, takeLatestItems} from "@memebox/utils";
import {ActionVariableConfig} from "@memebox/action-variables";
import {ActionQueueEventBus} from "../providers/actions/action-queue-event.bus";
import {Optional} from "@tsed/schema";
import {map} from "rxjs/operators";

export interface SimpleActionInformation extends HasId {
  name: string;
  type: ActionType;
  typeString: string;
  showOnMobile?: boolean;
  description?: string;
  hasVariables: boolean;
  variables?: ActionVariableConfig[]
}

@Controller(ENDPOINTS.ACTION.PREFIX)
export class ActionController {
  private latest20Actions: TriggerActionDashboardEntry[] = [];

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private _actionEventBus: ActionQueueEventBus
  ) {
    _actionEventBus.AllQueuedActions$.pipe(
      map(originalAction => ({...originalAction, timestamp: new Date()}) as TriggerActionDashboardEntry),
      takeLatestItems(20)
    ).subscribe(value => {
      this.latest20Actions = value;
    });
  }


  @Get(ENDPOINTS.ACTION.SIMPLE_LIST)
  getList(): SimpleActionInformation[] {
    const allActions = this._persistence.listActions()
      .filter(a => ![ActionType.WidgetTemplate, ActionType.PermanentScript].includes(a.type));

    return allActions.map(
      a => {
        const hasVariables = actionCanBeTriggeredWithVariables(a);
        const variableList: ActionVariableConfig[] =
          hasVariables
            ? getVariablesListOfAction(a)
            : [];

        return {
          id: a.id,
          name: a.name,
          type: a.type,
          typeString: ACTION_TYPE_INFORMATION[a.type].labelFallback,
          description: a.description,
          showOnMobile: a.showOnMobile,
          hasVariables: hasVariables,
          variables: variableList
        }
      }
    )
  }

  @Get(ENDPOINTS.ACTION.LAST_20_ACTIONS)
  getLast20Events(): TriggerActionDashboardEntry[] {
    return this.latest20Actions;
  }

  @Post(`${ENDPOINTS.ACTION.TRIGGER_ACTION}:actionId`)
  triggerAction(
    @PathParams("actionId") actionId: string,

    @Optional() @BodyParams() triggerAction: TriggerAction
  ) {
    const actionToTrigger: TriggerAction = {
      id: actionId,
      ...triggerAction
    };

    this._actionEventBus.queueAction(actionToTrigger);
  }
}
