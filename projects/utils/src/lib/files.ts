import {MediaType} from "../../../contracts/src/lib/media.types";

export function fileEndingToType (fileEnding: string) : MediaType {
  fileEnding = fileEnding.toLowerCase().replace('.', '');

  switch (fileEnding) {
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'png':
      return MediaType.Picture;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
      return MediaType.Audio;
    case 'mp4':
    case 'webm':
      return MediaType.Video;
  }
}
