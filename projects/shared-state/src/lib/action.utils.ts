import {ActionType} from "@memebox/contracts";

export function isVisibleMedia (actionType: ActionType) {
  return [ActionType.IFrame, ActionType.Widget, ActionType.Picture, ActionType.Video].includes(actionType);
}
