import {ActionActiveStatePayload, ActionStateEnum, TriggerActionOverrides} from "@memebox/contracts";

export interface ActionStateEntry {
  state: ActionStateEnum;
  triggeredOverrides?: TriggerActionOverrides;
  currentOverrides?: TriggerActionOverrides;
}

export type ActionStateEntries = Record<string, Record<string, ActionStateEntry>>;

function ensureStateEntryExist (
  state: ActionStateEntries,
  actionId: string,
  screenId: string
) : ActionStateEntry {
  if (!state[actionId]) {
    state[actionId] = {};
  }

  const objFromState = state[actionId][screenId];

  if (!objFromState) {
    return state[actionId][screenId] = {
      state: ActionStateEnum.Unset
    };
  }

  return objFromState;
}

export function resetActivityForScreenId (
  state: ActionStateEntries,
  screenId: string
): void {
  for (const actionId of Object.keys(state)) {
    for (const stateScreenId of Object.keys(state[actionId])) {
      if (stateScreenId === screenId) {
        ensureStateEntryExist(state,actionId, screenId).state = ActionStateEnum.Unset;
        break;
      }
    }
  }
}

export function updateActivityInState (
  state: ActionStateEntries,
  update: ActionActiveStatePayload
): void  {
  if (!state[update.mediaId]) {
    state[update.mediaId] = {};
  }

  const screenId = update.screenId ?? update.mediaId;
  const actionStateEntry = ensureStateEntryExist(state, update.mediaId, screenId);

  if (actionStateEntry.state === ActionStateEnum.Triggered) {
    actionStateEntry.triggeredOverrides = update.overrides;
  } else {
    actionStateEntry.currentOverrides = update.overrides;
  }

  actionStateEntry.state = update.state;
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

    return screenExists.state === activeState;
  }

  const values = Object.values(mediaInState).map(entry => entry.state)

  if (values.length === 0) {
    return false;
  }

  return values.includes(activeState);
}
