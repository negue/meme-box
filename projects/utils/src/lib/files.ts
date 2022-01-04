import {ActionType} from "@memebox/contracts";

export function fileEndingToType (fileEnding: string) : ActionType {
  fileEnding = fileEnding.toLowerCase().replace('.', '');

  switch (fileEnding) {
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'png':
      return ActionType.Picture;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
      return ActionType.Audio;
    case 'mp4':
    case 'webm':
      return ActionType.Video;
  }
}
