import { Pipe, PipeTransform } from '@angular/core';
import { RecipeEntry, RecipeSubCommandInfo } from "@memebox/recipe-core";
import { Observable, of } from "rxjs";
import { AppQueries } from "@memebox/app-state";
import { BlueprintContextDirective } from "./blueprint-context.directive";

@Pipe({
  name: 'getEntrySubStepInfo$'
})
export class GetEntrySubStepInfoPipe implements PipeTransform {

  constructor (
    private context: BlueprintContextDirective,
    private appQueries: AppQueries
  ) {
  }

  transform(value: RecipeEntry): Observable<RecipeSubCommandInfo[]> {
    if (!value) {
      return of([]);
    }

    switch (value.entryType) {
      case 'step':
      case  'group':
        return of(value.subCommandBlocks.map(({labelId,entries}) => {
          return {
            name: labelId,
            labelId: labelId,
            label: 'TODO LABEL OF '+labelId,
            entries
          };
        }));
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
