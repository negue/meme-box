import {Pipe, PipeTransform} from '@angular/core';
import {ActionVariableConfig} from "@memebox/action-variables";
import {Dictionary} from "@memebox/contracts";

@Pipe({
  name: 'variableValueOrFallback'
})
export class VariableValueOrFallbackPipe implements PipeTransform {

  transform(
    variable: ActionVariableConfig,
    currentData: Dictionary<unknown>,
    fallbackData: Dictionary<unknown>
  ): unknown {
    if (typeof currentData[variable.name] !== 'undefined') {
      return currentData[variable.name];
    }

    if (fallbackData && typeof fallbackData[variable.name] !== 'undefined' ) {
      return fallbackData[variable.name];
    }

    return variable.fallback
  }

}
