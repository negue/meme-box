import {SCRIPT_VARIABLES_KEY} from "@memebox/utils";
import {ActionVariableConfig, ActionVariableTypes} from "./types";
import {Action, ActionType} from "@memebox/contracts";

export function getVariablesListOfAction(action: Action): ActionVariableConfig[] {
  if (![ActionType.Widget, ActionType.Script].includes(action.type)) {
    return [];
  }

  const parsedJson = JSON.parse(action.extended?.[SCRIPT_VARIABLES_KEY] as string ?? '[]');

  return parsedJson as ActionVariableConfig[];
}

export function convertExtendedToTypeValues (value: unknown, variableType: ActionVariableTypes): unknown {
  if (!value) {
    return value;
  }

  switch (variableType){
    case ActionVariableTypes.number: {
      return +value;
    }

    case ActionVariableTypes.boolean: {
      return value === 'true';
    }

    case ActionVariableTypes.actionList: {
      return JSON.parse(value as string)
    }

    default: {
      return value;
    }
  }

}
