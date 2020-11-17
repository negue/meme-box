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
  sortOrder: number;
}

export const MEDIA_TYPE_INFORMATION: Dictionary<MediaTypeInformations> = {
  [MediaType.Picture]: {
    label: 'Image',
    className: 'image',
    icon: 'insert_photo',
    sortOrder: 2,
  },
  [MediaType.Video]: {
    label: 'Video',
    className: 'video',
    icon: 'videocam',
    sortOrder: 3,
  },
  [MediaType.Audio]: {
    label: 'Audio',
    className: 'audio',
    icon: 'audiotrack',
    sortOrder: 1
  },
  [MediaType.IFrame]: {
    label: 'iFrame', // IFrame , iframe
    className: 'iframe',
    icon: 'public',
    sortOrder: 4,
  },
  [MediaType.Meta]: {
    icon: 'art_track',
    label: 'Meta',
    className: '', // not visible in target-screen-component
    sortOrder: 5
  }
}

export function mediaToString (mediaType: MediaType) {
  return MEDIA_TYPE_INFORMATION[mediaType]?.label ?? '';
}

export function sortOrderByType(mediaType: MediaType) {
  return MEDIA_TYPE_INFORMATION[mediaType]?.sortOrder;
}
