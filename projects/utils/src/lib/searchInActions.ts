import {Action, ActionType} from "@memebox/contracts";
import {NOT_ALLOWED_SCRIPT_VARIABLE_NAMES, NOT_ALLOWED_WIDGET_VARIABLE_NAMES} from "@memebox/utils";

export function hasAdditionalContentToSearch (actionType: ActionType) {
  return [
    ActionType.Widget, ActionType.WidgetTemplate,
    ActionType.Script, ActionType.PermanentScript,
  ].includes(actionType);
}

const fieldsToCheck = NOT_ALLOWED_WIDGET_VARIABLE_NAMES.concat(NOT_ALLOWED_SCRIPT_VARIABLE_NAMES);

export function actionContentContainsText (action: Action, lowerCaseTextToSearch: string) {
  for (const fieldToCheck of fieldsToCheck) {
    if (action.extended?.[fieldToCheck]?.toLowerCase().includes(lowerCaseTextToSearch)) {
      return true;
    }
  }

  return false;
}
