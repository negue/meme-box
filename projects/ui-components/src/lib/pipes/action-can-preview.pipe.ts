import {Pipe, PipeTransform} from '@angular/core';
import {Clip, MediaType} from "@memebox/contracts";

@Pipe({
  name: 'actionCanPreview'
})
export class ActionCanPreviewPipe implements PipeTransform {


  transform(value: Clip): boolean {
    return ![
      MediaType.WidgetTemplate,
      MediaType.PermanentScript
    ].includes(value.type);
  }
}
