import {Pipe, PipeTransform} from '@angular/core';
import {RecipeEntry, RecipeEntryCommandCall} from "@memebox/recipe-core";

@Pipe({
  name: 'isCommandEntryPipe'
})
export class IsCommandEntryPipe implements PipeTransform {

  constructor () {
  }

  transform(value: RecipeEntry): value is RecipeEntryCommandCall {
    return value.entryType === 'command';
  }

}
