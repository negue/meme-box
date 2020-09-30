import {Pipe, PipeTransform} from "@angular/core";
import {MEDIA_TYPE_INFORMATION, MediaType} from "@memebox/contracts";

@Pipe({
  name: "mediaTypeClass",
  pure: true,
})
export class MediaTypeClassPipe implements PipeTransform {
  transform(value: MediaType): string {
    return MEDIA_TYPE_INFORMATION[value]?.className ?? '';
  }
}
