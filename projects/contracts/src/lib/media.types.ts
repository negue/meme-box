export enum ActionType {
  Invalid = -1,
  Picture = 0,
  Audio = 1,
  Video = 2,
  IFrame = 3,
  Widget = 4,
  Script = 5,

  PermanentScript = 98,
  WidgetTemplate = 99,
  Meta = 100,
  Recipe = 101,
}

export interface ActionTypeInformations {
  translationKey: string;
  labelFallback: string;
  className: string;
  icon: string;
  sortOrder: number;
  mediaType: ActionType;
}

export const ACTION_TYPE_INFORMATION: Record<ActionType, ActionTypeInformations> = {
  [ActionType.Invalid]: /*{
    translationKey: "",
    labelFallback: "Invalid",
    className: "",
    icon: "",
    sortOrder: -1
  }*/ undefined,
  [ActionType.Picture]: {
    translationKey: "actionType.image",
    labelFallback: "Image",
    className: "image",
    icon: "insert_photo",
    sortOrder: 2,
    mediaType: ActionType.Picture
  },
  [ActionType.Video]: {
    translationKey: "actionType.video",
    labelFallback: "Video",
    className: "video",
    icon: "videocam",
    sortOrder: 3,
    mediaType: ActionType.Video
  },
  [ActionType.Audio]: {
    translationKey: "actionType.audio",
    labelFallback: "Audio",
    className: "audio",
    icon: "audiotrack",
    sortOrder: 1,
    mediaType: ActionType.Audio
  },
  [ActionType.IFrame]: {
    translationKey: "actionType.iframe",
    labelFallback: "iFrame", // IFrame , iframe
    className: "iframe",
    icon: "public",
    sortOrder: 4,
    mediaType: ActionType.IFrame
  },
  [ActionType.Widget]: {
    translationKey: "actionType.widget",
    labelFallback: "Widget", // todo rename the property, add a "translationKey" to it
    className: "html",
    icon: "code",
    sortOrder: 5,
    mediaType: ActionType.Widget
  },
  [ActionType.Script]: {
    translationKey: "actionType.script",
    labelFallback: "Script", // todo rename the property, add a "translationKey" to it
    className: "",
    icon: "code",
    sortOrder: 7,
    mediaType: ActionType.Script
  },
  [ActionType.PermanentScript]: {
    translationKey: "actionType.permanent_script",
    labelFallback: "Permanent Script", // todo rename the property, add a "translationKey" to it
    className: "",
    icon: "code",
    sortOrder: 8,
    mediaType: ActionType.PermanentScript
  },
  [ActionType.WidgetTemplate]: {
    translationKey: "actionType.widgetTemplate",
    labelFallback: "Widget Template", // todo rename the property, add a "translationKey" to it
    className: "html",
    icon: "code", // new icon?
    sortOrder: 6,
    mediaType: ActionType.WidgetTemplate
  },
  [ActionType.Meta]: {
    translationKey: "actionType.meta",
    icon: "art_track",
    labelFallback: "Meta",
    className: "", // not visible in target-screen-component
    sortOrder: 100,
    mediaType: ActionType.Meta
  },
  [ActionType.Recipe]: {
    translationKey: "actionType.recipe",
    icon: "playlist_play",
    labelFallback: "Recipe",
    className: "", // not visible in target-screen-component
    sortOrder: 101,
    mediaType: ActionType.Recipe
}
} as const;

export const ACTION_TYPE_INFORMATION_ARRAY = Object.values(ACTION_TYPE_INFORMATION)
  .filter(value => !!value);

export function getSortOrderByType(mediaType: ActionType): number  {
  return ACTION_TYPE_INFORMATION[mediaType]?.sortOrder;
}
