import {Pipe, PipeTransform} from '@angular/core';
import {Action, ActionType} from "@memebox/contracts";

// TODO replace by using the ACTION_TYPE_INFORMATION

@Pipe({
  name: 'showScreenSelection'
})
export class ShowScreenSelectionPipe implements PipeTransform {

  transform(action: Action): boolean {
    if (!action) {
      return false;
    }

    return ![ActionType.Script, ActionType.Recipe, ActionType.WidgetTemplate].includes(action.type);
  }
}
