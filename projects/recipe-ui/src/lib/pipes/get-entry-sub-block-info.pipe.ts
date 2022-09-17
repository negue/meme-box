import {Pipe, PipeTransform} from '@angular/core';
import {
  RecipeCommandRegistry,
  RecipeEntry,
  RecipeEntryCommandCall,
  RecipeRootCommandBlockId,
  RecipeSubCommandInfo
} from "@memebox/recipe-core";
import {from, Observable, of} from "rxjs";
import {AppQueries} from "@memebox/app-state";
import {RecipeContextDirective} from "../recipe-context.directive";

@Pipe({
  name: 'getEntrySubBlockInfoArray$'
})
export class GetEntrySubBlockInfoArrayPipe implements PipeTransform {

  constructor (
    private context: RecipeContextDirective,
    private appQueries: AppQueries
  ) {
  }

  transform(value: RecipeEntry): Observable<RecipeSubCommandInfo[]> {
    if (!value) {
      return of([]);
    }

    if (value.id === this.context.recipe?.rootEntry) {
      return of([
        {
          name: 'entries',
          labelId: RecipeRootCommandBlockId,
          label: 'Recipe Commands',
          entries: []
        }
      ]);
    }

    switch (value.entryType) {
      case 'command': {
        const commandBlocksArray = value.subCommandBlocks.map(
          async ({labelId, entries}) => {
            const label = await this._getLabelAsync(value, labelId);
            return {
              name: labelId,
              labelId: labelId,
              label,
              entries
            };
          });

        return from(Promise.all(commandBlocksArray));
      }
      case  'group':
      case 'function':
        // if a function has a callback which can trigger other stuff
        return of([
          {
            name: 'entries',
            labelId: 'step',
            label: 'TODO LABEL OF group/function',
            entries: []
          }
        ]);
    }
  }

  async _getLabelAsync(
    recipeEntryCall: RecipeEntryCommandCall,
    labelId: string
  ): Promise<string> {
    const commandInfo = RecipeCommandRegistry[recipeEntryCall.commandBlockType];
    const label = commandInfo.subCommandBlockLabelAsync
      ? await commandInfo.subCommandBlockLabelAsync(this.appQueries, recipeEntryCall, labelId)
      : `TODO LABEL OF ${recipeEntryCall.commandBlockType}:${labelId}`;

    return label;
  }
}
