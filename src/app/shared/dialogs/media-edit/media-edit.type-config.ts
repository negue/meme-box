import {ActionType} from "@memebox/contracts";

interface ActionEditConfig {
  hasTypeSettings: boolean;
  canSelectQueue: boolean;
  hasPath: boolean;
  hasHtmlPreview?: boolean;
}

export const ACTION_EDIT_CONFIG: Record<string, ActionEditConfig> = {
  [ActionType.Invalid]: undefined,
  [ActionType.Picture]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasPath: true
  },
  [ActionType.Video]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasPath: true
  },
  [ActionType.Audio]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasPath: true
  },
  [ActionType.IFrame]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasPath: true
  },
  [ActionType.Widget]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasPath: false,
    hasHtmlPreview: true
  },
  [ActionType.Script]: {
    hasTypeSettings: false,
    canSelectQueue: true,
    hasPath: false
  },
  [ActionType.PermanentScript]: {
    hasTypeSettings: false,
    canSelectQueue: false,
    hasPath: false
  },
  [ActionType.WidgetTemplate]: {
    hasTypeSettings: true,
    canSelectQueue: false,
    hasPath: false,
    hasHtmlPreview: true
  },
  [ActionType.Meta]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasPath: false
  },
  [ActionType.Blueprint]: {
    hasTypeSettings: true,
    canSelectQueue: true,
    hasPath: false
  }
} as const;

// todo change those enums to the above config object

export const MEDIA_TYPES_WITHOUT_PLAYTIME = [
  ActionType.Meta,
  ActionType.WidgetTemplate,
  ActionType.Script,
  ActionType.PermanentScript,
  ActionType.Blueprint,
];
export const MEDIA_TYPES_WITH_REQUIRED_PLAYLENGTH = [ActionType.Widget, ActionType.Picture, ActionType.IFrame];
