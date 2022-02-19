import {ActionType} from "@memebox/contracts";

interface MediaEditConfig {
  hasTypeSettings: boolean;
  canSelectQueue: boolean;
}

export const MEDIA_EDIT_CONFIG: Record<string, MediaEditConfig> = {
  [ActionType.Invalid]: undefined,
  [ActionType.Picture]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [ActionType.Video]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [ActionType.Audio]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [ActionType.IFrame]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [ActionType.Widget]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [ActionType.Script]: {
    hasTypeSettings: false,
    canSelectQueue: true,
  },
  [ActionType.PermanentScript]: {
    hasTypeSettings: false,
    canSelectQueue: false,
  },
  [ActionType.WidgetTemplate]: {
    hasTypeSettings: true,
    canSelectQueue: false,
  },
  [ActionType.Meta]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  }
} as const;

// todo change those enums to the above config object

export const MEDIA_TYPES_WITHOUT_PATH = [
  ActionType.Widget,
  ActionType.WidgetTemplate,
  ActionType.Meta,
  ActionType.Script,
  ActionType.PermanentScript
];
export const MEDIA_TYPES_WITHOUT_PLAYTIME = [
  ActionType.Meta,
  ActionType.WidgetTemplate,
  ActionType.Script,
  ActionType.PermanentScript
];
export const MEDIA_TYPES_WITH_REQUIRED_PLAYLENGTH = [ActionType.Widget, ActionType.Picture, ActionType.IFrame];
