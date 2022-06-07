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
  /**
   * @deprecated will be removed in a different version
   */
  Meta = 100,
  Recipe = 101,
}

export interface ActionTypeInformations {
  translationKey: string;
  labelFallback: string;
  className: string;
  icon: string;
  sortOrder: number;
  actionType: ActionType;
  isEnabled: boolean;
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
    actionType: ActionType.Picture,
    isEnabled: true,
  },
  [ActionType.Video]: {
    translationKey: "actionType.video",
    labelFallback: "Video",
    className: "video",
    icon: "videocam",
    sortOrder: 3,
    actionType: ActionType.Video,
    isEnabled: true,
  },
  [ActionType.Audio]: {
    translationKey: "actionType.audio",
    labelFallback: "Audio",
    className: "audio",
    icon: "audiotrack",
    sortOrder: 1,
    actionType: ActionType.Audio,
    isEnabled: true,
  },
  [ActionType.IFrame]: {
    translationKey: "actionType.iframe",
    labelFallback: "iFrame", // IFrame , iframe
    className: "iframe",
    icon: "public",
    sortOrder: 4,
    actionType: ActionType.IFrame,
    isEnabled: true,
  },
  [ActionType.Widget]: {
    translationKey: "actionType.widget",
    labelFallback: "Widget", // todo rename the property, add a "translationKey" to it
    className: "html",
    icon: "code",
    sortOrder: 5,
    actionType: ActionType.Widget,
    isEnabled: true,
  },
  [ActionType.Script]: {
    translationKey: "actionType.script",
    labelFallback: "Script", // todo rename the property, add a "translationKey" to it
    className: "",
    icon: "code",
    sortOrder: 7,
    actionType: ActionType.Script,
    isEnabled: true,
  },
  [ActionType.PermanentScript]: {
    translationKey: "actionType.permanent_script",
    labelFallback: "Permanent Script", // todo rename the property, add a "translationKey" to it
    className: "",
    icon: "code",
    sortOrder: 8,
    actionType: ActionType.PermanentScript,
    isEnabled: true,
  },
  [ActionType.WidgetTemplate]: {
    translationKey: "actionType.widgetTemplate",
    labelFallback: "Widget Template", // todo rename the property, add a "translationKey" to it
    className: "html",
    icon: "code", // new icon?
    sortOrder: 6,
    actionType: ActionType.WidgetTemplate,
    isEnabled: true,
  },
  [ActionType.Meta]: {
    translationKey: "actionType.meta",
    icon: "art_track",
    labelFallback: "Meta",
    className: "", // not visible in target-screen-component
    sortOrder: 100,
    actionType: ActionType.Meta,
    isEnabled: false,
  },
  [ActionType.Recipe]: {
    translationKey: "actionType.recipe",
    icon: "playlist_play",
    labelFallback: "Recipe",
    className: "", // not visible in target-screen-component
    sortOrder: 101,
    actionType: ActionType.Recipe,
    isEnabled: true,
}
} as const;

export const ACTION_TYPE_INFORMATION_ARRAY = Object.values(ACTION_TYPE_INFORMATION)
  .filter(value => !!value && value.isEnabled);

export function getSortOrderByType(mediaType: ActionType): number  {
  return ACTION_TYPE_INFORMATION[mediaType]?.sortOrder;
}

export function isEnabled(actionType: ActionType) {
  return ACTION_TYPE_INFORMATION[actionType]?.isEnabled ?? false;
}
