import {Pipe, PipeTransform} from '@angular/core';
import {Action} from "@memebox/contracts";
import {actionCanBeTriggeredWithVariables} from "@memebox/utils";

@Pipe({
  name: 'actionHasTriggerableVariables'
})
export class ActionHasTriggerableVariablesPipe implements PipeTransform {


  transform(value: Action): boolean {
    return actionCanBeTriggeredWithVariables(value);
  }
}
