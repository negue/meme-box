import {Pipe, PipeTransform} from '@angular/core';
import {MediaType} from "@memebox/contracts";

@Pipe({
  name: 'mediaType',
  pure: true
})
export class MediaTypePipe implements PipeTransform {

  transform(value: MediaType): string {
    switch (value) {
      case MediaType.Picture:
        return 'Image';
      case MediaType.Video:
        return 'Video';
      case MediaType.Audio:
        return 'Audio';
      default:
        return '';
    }
  }

}
