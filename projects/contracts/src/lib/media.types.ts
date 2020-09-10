export enum MediaType {
  Picture = 0,
  Audio = 1,
  Video = 2,
  IFrame = 3,


  Meta = 100
}

export function mediaToString (mediaType: MediaType) {
  switch (mediaType) {
    case MediaType.Picture:
      return 'Image';
    case MediaType.Video:
      return 'Video';
    case MediaType.Audio:
      return 'Audio';
    case MediaType.IFrame:
      return 'iframe';
    case MediaType.Meta:
      return 'Meta';
    default:
      return '';
  }
}
