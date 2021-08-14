import {Pipe, PipeTransform} from '@angular/core';
import {ScriptVariable} from "@memebox/utils";

@Pipe({
  name: 'variableConverter'
})
export class VariableConverterPipe implements PipeTransform {

  transform(value: ScriptVariable, ...args: unknown[]): unknown {
    return null;
  }

}
