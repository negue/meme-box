import {Pipe, PipeTransform} from '@angular/core';
import {ActionVariableTypes, convertExtendedToTypeValues} from "@memebox/action-variables";

@Pipe({
  name: 'variableConverter'
})
export class VariableConverterPipe implements PipeTransform {

  transform(value: unknown, variableType: ActionVariableTypes): unknown {
   return convertExtendedToTypeValues(value, variableType);
  }

}
