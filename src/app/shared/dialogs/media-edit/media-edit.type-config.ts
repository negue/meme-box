import {MediaType} from "@memebox/contracts";

interface MediaEditConfig {
  hasTypeSettings: boolean;
  canSelectQueue: boolean;
}

export const MEDIA_EDIT_CONFIG: Record<string, MediaEditConfig> = {
  [MediaType.Invalid]: undefined,
  [MediaType.Picture]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [MediaType.Video]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [MediaType.Audio]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [MediaType.IFrame]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [MediaType.Widget]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  },
  [MediaType.Script]: {
    hasTypeSettings: false,
    canSelectQueue: true,
  },
  [MediaType.PermanentScript]: {
    hasTypeSettings: false,
    canSelectQueue: false,
  },
  [MediaType.WidgetTemplate]: {
    hasTypeSettings: true,
    canSelectQueue: false,
  },
  [MediaType.Meta]: {
    hasTypeSettings: true,
    canSelectQueue: true,
  }
} as const;

// todo change those enums to the above config object

export const MEDIA_TYPES_WITHOUT_PATH = [
  MediaType.Widget,
  MediaType.WidgetTemplate,
  MediaType.Meta,
  MediaType.Script,
  MediaType.PermanentScript
];
export const MEDIA_TYPES_WITHOUT_PLAYTIME = [
  MediaType.Meta,
  MediaType.WidgetTemplate,
  MediaType.Script,
  MediaType.PermanentScript
];
export const MEDIA_TYPES_WITH_REQUIRED_PLAYLENGTH = [MediaType.Widget, MediaType.Picture, MediaType.IFrame];
