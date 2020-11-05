import {Dictionary} from "./types";

export enum MediaType {
  Picture = 0,
  Audio = 1,
  Video = 2,
  IFrame = 3,


  Meta = 100
}

export interface MediaTypeInformations {
  label: string;
  className: string;
  icon: string;
}

export const MEDIA_TYPE_INFORMATION: Dictionary<MediaTypeInformations> = {
  [MediaType.Picture]: {
    label: 'Image',
    className: 'image',
    icon: 'insert_photo'
  },
  [MediaType.Video]: {
    label: 'Video',
    className: 'video',
    icon: 'videocam'
  },
  [MediaType.Audio]: {
    label: 'Audio',
    className: 'audio',
    icon: 'audiotrack'
  },
  [MediaType.IFrame]: {
    label: 'iFrame', // IFrame , iframe
    className: 'iframe',
    icon: 'public',
  },
  [MediaType.Meta]: {
    icon: 'art_track',
    label: 'Meta',
    className: '' // not visible in target-screen-component
  }
}

export function mediaToString (mediaType: MediaType) {
  return MEDIA_TYPE_INFORMATION[mediaType]?.label ?? '';
}
