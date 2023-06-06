import {Pipe, PipeTransform} from '@angular/core';
import {RecipeStepConfigArguments} from "@memebox/recipe-core";

@Pipe({
  name: 'shouldShowVariablesPanel'
})
export class ShouldShowVariablesPanelPipe implements PipeTransform {

  transform(config: RecipeStepConfigArguments): boolean {
    switch (config.type){
      case "text":
      case "textarea":
        return config.flags.canUseVariables;
      default:
        return false;
    }
  }

}
