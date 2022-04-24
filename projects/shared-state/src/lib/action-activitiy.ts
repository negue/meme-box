import {ActionActiveStatePayload, ActionStateEnum} from "@memebox/contracts";

export type ActionStateEntries = Record<string, Record<string, ActionStateEnum>>;

export function updateActivityInState (
  state: ActionStateEntries,
  update: ActionActiveStatePayload
): void  {
  if (!state[update.mediaId]) {
    state[update.mediaId] = {};
  }

  state[update.mediaId][update.screenId ?? update.mediaId] = update.state;
}

export function isActionCurrently (
  state: ActionStateEntries,
  activeState: ActionStateEnum,
  actionId: string,
  screenId?: string
): boolean  {
  const mediaInState = state[actionId];

  if (!mediaInState) {
    return false;
  }

  if (screenId) {
    const screenExists = mediaInState[screenId];

    if (!screenExists) {
      return false;
    }

    return screenExists === activeState;
  }

  const values = Object.values(mediaInState)

  if (values.length === 0) {
    return false;
  }

  return values.includes(activeState);
}
