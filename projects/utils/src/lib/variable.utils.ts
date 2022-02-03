// TODO how to translate with variables?
import {Action, ActionType} from "@memebox/contracts";
import {ActionVariableConfig} from "@memebox/action-variables";


export const SCRIPT_VARIABLES_KEY = '_variables';

export function isDynamicIframeVariableValid(name: string, notAllowedNames: string[]): {ok: boolean, message: string} {
  if (notAllowedNames.includes(name)) {
    return { ok: false, message: `Not allowed to be one of the following names: ${notAllowedNames.join(', ')}`}
  }

  if (name === '') {
    return { ok: false, message:  'A variable needs a name.'};
  }

  if (name.includes(' ')) {
    return { ok: false, message:  `Variable Names can't have spaces in it: "${name}"`};
  }


  return {ok: true, message: ''};
}

export const ACTION_TYPES_WITH_VARIABLES: ActionType[] = [
  ActionType.Widget, ActionType.WidgetTemplate,
  ActionType.Script, ActionType.PermanentScript
];

export function actionHasVariables (action: Action) {
  return ACTION_TYPES_WITH_VARIABLES.includes(action.type)
    && !!action.extended?.[SCRIPT_VARIABLES_KEY]
    && action.extended[SCRIPT_VARIABLES_KEY] !== '[]';
}

export const ACTION_TYPES_WITH_TRIGGERABLE_VARIABLES: ActionType[] = [
  ActionType.Widget,
  ActionType.Script
];

export function actionCanBeTriggeredWithVariables (action: Action) {
  return ACTION_TYPES_WITH_TRIGGERABLE_VARIABLES.includes(action.type) && actionHasVariables(action);
}

export function getVariablesListOfAction (action: Partial<Action>): ActionVariableConfig[] {
 return JSON.parse(action.extended?.[SCRIPT_VARIABLES_KEY] ?? '[]');
}
