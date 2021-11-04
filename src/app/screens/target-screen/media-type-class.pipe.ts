import {Pipe, PipeTransform} from "@angular/core";
import {ACTION_TYPE_INFORMATION, ActionType} from "@memebox/contracts";

@Pipe({
  name: "mediaTypeClass",
  pure: true,
})
export class MediaTypeClassPipe implements PipeTransform {
  transform(value: ActionType): string {
    return ACTION_TYPE_INFORMATION[value]?.className ?? '';
  }
}
