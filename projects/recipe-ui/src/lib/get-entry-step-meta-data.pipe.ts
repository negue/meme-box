import { Pipe, PipeTransform } from '@angular/core';
import { RecipeCommandInfo, RecipeCommandRegistry, RecipeEntry } from "@memebox/recipe-core";
import { AppQueries } from "@memebox/app-state";

@Pipe({
  name: 'getEntryStepMetaData$'
})
export class GetEntryStepMetaDataPipe implements PipeTransform {

  constructor (
    private appQueries: AppQueries
  ) {
  }

  async transform(value: RecipeEntry, parentEntry: RecipeEntry): Promise<RecipeCommandInfo|null> {
    if (value.entryType !== 'command') {
      return  Promise.resolve(null)
    }

    const recipeCommandDefinition = RecipeCommandRegistry[value.commandBlockType];

    const entryLabel = await recipeCommandDefinition.commandEntryLabelAsync(this.appQueries, value.payload, parentEntry);

    return {
      stepType: value.commandBlockType,
      label: entryLabel,
    };
  }

}
