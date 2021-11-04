import {Pipe, PipeTransform} from '@angular/core';
import {Action, ActionType} from "@memebox/contracts";

@Pipe({
  name: 'actionCanPreview'
})
export class ActionCanPreviewPipe implements PipeTransform {


  transform(value: Action): boolean {
    return ![
      ActionType.WidgetTemplate,
      ActionType.PermanentScript
    ].includes(value.type);
  }
}
