import {Pipe, PipeTransform} from '@angular/core';
import {RecipeStepConfigArguments} from "@memebox/recipe-core";

// todo maybe at some point this needs to be in an config type ... metadata config..something

@Pipe({
  name: 'shouldShowSettingLabelAbove'
})
export class ShouldShowSettingLabelAbovePipe implements PipeTransform {

  transform(value: RecipeStepConfigArguments["type"]): boolean {
    switch (value){
      case "boolean":
      case "number":
      case "text":
      case "textarea":
      case "selectionStatic":
        return false;
      default:
        return true;
    }
  }

}
