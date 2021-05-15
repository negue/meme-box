export enum MediaType {
  Invalid = -1,
  Picture = 0,
  Audio = 1,
  Video = 2,
  IFrame = 3,
  Widget = 4,
  Script = 5,


  WidgetTemplate = 99,
  Meta = 100
}

export interface MediaTypeInformations {
  translationKey: string;
  labelFallback: string;
  className: string;
  icon: string;
  sortOrder: number;
  mediaType: MediaType;
}

export const MEDIA_TYPE_INFORMATION: Record<MediaType, MediaTypeInformations> = {
  [MediaType.Invalid]: /*{
    translationKey: "",
    labelFallback: "Invalid",
    className: "",
    icon: "",
    sortOrder: -1
  }*/ undefined,
  [MediaType.Picture]: {
    translationKey: "mediaType.image",
    labelFallback: "Image",
    className: "image",
    icon: "insert_photo",
    sortOrder: 2,
    mediaType: MediaType.Picture
  },
  [MediaType.Video]: {
    translationKey: "mediaType.video",
    labelFallback: "Video",
    className: "video",
    icon: "videocam",
    sortOrder: 3,
    mediaType: MediaType.Video
  },
  [MediaType.Audio]: {
    translationKey: "mediaType.audio",
    labelFallback: "Audio",
    className: "audio",
    icon: "audiotrack",
    sortOrder: 1,
    mediaType: MediaType.Audio
  },
  [MediaType.IFrame]: {
    translationKey: "mediaType.iframe",
    labelFallback: "iFrame", // IFrame , iframe
    className: "iframe",
    icon: "public",
    sortOrder: 4,
    mediaType: MediaType.IFrame
  },
  [MediaType.Widget]: {
    translationKey: "mediaType.widget",
    labelFallback: "Widget", // todo rename the property, add a "translationKey" to it
    className: "html",
    icon: "code",
    sortOrder: 5,
    mediaType: MediaType.Widget
  },
  [MediaType.Script]: {
    translationKey: "mediaType.script",
    labelFallback: "Script", // todo rename the property, add a "translationKey" to it
    className: "",
    icon: "code",
    sortOrder: 6,
    mediaType: MediaType.Script
  },
  [MediaType.WidgetTemplate]: {
    translationKey: "mediaType.widgetTemplate",
    labelFallback: "Widget Template", // todo rename the property, add a "translationKey" to it
    className: "html",
    icon: "code", // new icon?
    sortOrder: 99,
    mediaType: MediaType.WidgetTemplate
  },
  [MediaType.Meta]: {
    translationKey: "mediaType.meta",
    icon: "art_track",
    labelFallback: "Meta",
    className: "", // not visible in target-screen-component
    sortOrder: 100,
    mediaType: MediaType.Meta
  }
} as const;

export const MEDIA_TYPE_INFORMATION_ARRAY = Object.values(MEDIA_TYPE_INFORMATION)
  .filter(value => !!value);

export function getSortOrderByType(mediaType: MediaType) {
  return MEDIA_TYPE_INFORMATION[mediaType]?.sortOrder;
}
