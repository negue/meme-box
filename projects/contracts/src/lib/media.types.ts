export enum MediaType {
  Invalid = -1,
  Picture = 0,
  Audio = 1,
  Video = 2,
  IFrame = 3,
  Widget = 4,


  Meta = 100
}

export interface MediaTypeInformations {
  translationKey: string;
  labelFallback: string;
  className: string;
  icon: string;
  sortOrder: number;
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
    translationKey: "mediaType.picture",
    labelFallback: "Image",
    className: "image",
    icon: "insert_photo",
    sortOrder: 2
  },
  [MediaType.Video]: {
    translationKey: "mediaType.video",
    labelFallback: "Video",
    className: "video",
    icon: "videocam",
    sortOrder: 3
  },
  [MediaType.Audio]: {
    translationKey: "mediaType.audio",
    labelFallback: "Audio",
    className: "audio",
    icon: "audiotrack",
    sortOrder: 1
  },
  [MediaType.IFrame]: {
    translationKey: "mediaType.iframe",
    labelFallback: "iFrame", // IFrame , iframe
    className: "iframe",
    icon: "public",
    sortOrder: 4
  },
  [MediaType.Widget]: {
    translationKey: "mediaType.widget",
    labelFallback: "Widget", // todo rename the property, add a "translationKey" to it
    className: "html",
    icon: "code",
    sortOrder: 5
  },
  [MediaType.Meta]: {
    translationKey: "mediaType.meta",
    icon: "art_track",
    labelFallback: "Meta",
    className: "", // not visible in target-screen-component
    sortOrder: 100
  }
};

export function getSortOrderByType(mediaType: MediaType) {
  return MEDIA_TYPE_INFORMATION[mediaType]?.sortOrder;
}
