import {Controller, Get, Inject} from "@tsed/common";
import {ACTION_TYPE_INFORMATION, ActionType, ENDPOINTS, HasId} from "@memebox/contracts";
import {Persistence} from "../persistence";
import {PERSISTENCE_DI} from "../providers/contracts";
import {actionCanBeTriggeredWithVariables, getVariablesListOfAction} from "@memebox/utils";
import {ActionVariableConfig} from "@memebox/action-variables";

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

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence
  ) {
  }


  @Get(ENDPOINTS.ACTION.SIMPLE_LIST)
  getList(): SimpleActionInformation[] {
    const allActions = this._persistence.listClips()
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
}
