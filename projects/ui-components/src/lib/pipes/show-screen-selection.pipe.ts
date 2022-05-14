import { Pipe, PipeTransform } from '@angular/core';
import {Action, ActionType} from "@memebox/contracts";

@Pipe({
  name: 'showScreenSelection'
})
export class ShowScreenSelectionPipe implements PipeTransform {

  transform(action: Action): boolean {
    if (!action) {
      return false;
    }

    return ![ActionType.Script, ActionType.Meta, ActionType.WidgetTemplate].includes(action.type);
  }
}
