import { Pipe, PipeTransform } from '@angular/core';
import { RecipeCommandRegistry, RecipeEntry, RecipeSubCommandInfo } from "@memebox/recipe-core";
import { from, Observable, of } from "rxjs";
import { AppQueries } from "@memebox/app-state";
import { RecipeContextDirective } from "./recipe-context.directive";

@Pipe({
  name: 'getEntrySubBlockInfoArray$'
})
export class GetEntrySubBlockInfoArray$Pipe implements PipeTransform {

  constructor (
    private context: RecipeContextDirective,
    private appQueries: AppQueries
  ) {
  }

  transform(value: RecipeEntry): Observable<RecipeSubCommandInfo[]> {
    if (!value) {
      return of([]);
    }

    switch (value.entryType) {
      case 'command': {
        const commandBlocksArray = value.subCommandBlocks.map(
          async ({labelId, entries}) => {
            const commandInfo = RecipeCommandRegistry[value.commandBlockType];
            const label = commandInfo.subCommandBlockLabelAsync
              ? await commandInfo.subCommandBlockLabelAsync(this.appQueries, value, labelId)
              : `TODO LABEL OF ${value.commandBlockType}:${labelId}`;

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
            label: 'TODO LABEL OF step',
            entries: []
          }
        ]);
    }
  }
}
