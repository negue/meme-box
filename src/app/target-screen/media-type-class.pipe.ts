import { Pipe, PipeTransform } from "@angular/core";
import { MediaType } from "@memebox/contracts";

@Pipe({
  name: "mediaTypeClass",
  pure: true,
})
export class MediaTypeClassPipe implements PipeTransform {
  transform(value: MediaType): string {
    switch (value) {
      case MediaType.Picture:
        return "image";
      case MediaType.Video:
        return "video";
      case MediaType.Audio:
        return "audio";
      case MediaType.IFrame:
        return "iframe";
      default:
        return "";
    }
  }
}
