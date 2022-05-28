import { Pipe, PipeTransform } from '@angular/core';
import { Action, ActionType } from "@memebox/contracts";
import { ActionVariableConfig, getVariablesListOfAction } from "@memebox/action-variables";

@Pipe({
  name: 'actionVariableConfig'
})
export class ActionVariableConfigPipe implements PipeTransform {

  transform(action: Action): ActionVariableConfig[]|undefined {
    return action && [ActionType.Widget, ActionType.Script].includes(action.type)
      ? getVariablesListOfAction(action)
      : undefined;
  }

}
