import {MediaType} from "@memebox/contracts";

export const enum ActionVariableTypes {
  text = 'text',
  number = 'number',
  textarea = 'textarea',
  boolean = 'boolean',
  action = 'action',
  actionList = 'actionList',
}

export interface ActionVariableConfig {
  name: string; // TODO validations?
  hint: string;
  type: ActionVariableTypes;
  htmlNewLineBreak?: boolean;
  fallback: any; // TODO - might need some typesafety .. maybe during runtime
}

export function getVariableTypesByAction(actionType: MediaType) {
  if (actionType === MediaType.Widget) {
    return [
      ActionVariableTypes.number,
      ActionVariableTypes.text,
      ActionVariableTypes.textarea,
      ActionVariableTypes.boolean
    ];
  }

  if (actionType === MediaType.Script) {
    return [
      ActionVariableTypes.number,
      ActionVariableTypes.text,
      ActionVariableTypes.textarea,
      ActionVariableTypes.boolean,
      ActionVariableTypes.action,
      ActionVariableTypes.actionList,
    ];
  }

  return [];
}
