import {MediaType} from "@memebox/contracts";

interface MediaEditConfig {
  hasTypeSettings: boolean;
}

export const MEDIA_EDIT_CONFIG: Record<string, MediaEditConfig> = {
  [MediaType.Invalid]: undefined,
  [MediaType.Picture]: {
    hasTypeSettings: true,
  },
  [MediaType.Video]: {
    hasTypeSettings: true,
  },
  [MediaType.Audio]: {
    hasTypeSettings: true,
  },
  [MediaType.IFrame]: {
    hasTypeSettings: true,
  },
  [MediaType.Widget]: {
    hasTypeSettings: true,
  },
  [MediaType.Script]: {
    hasTypeSettings: false,
  },
  [MediaType.PermanentScript]: {
    hasTypeSettings: false,
  },
  [MediaType.WidgetTemplate]: {
    hasTypeSettings: true,
  },
  [MediaType.Meta]: {
    hasTypeSettings: true,
  }
} as const;


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
