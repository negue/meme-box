import {Pipe, PipeTransform} from '@angular/core';
import {BlueprintEntry, BlueprintStepInfo} from "@memebox/logic-step-core";
import {Observable, of} from "rxjs";

@Pipe({
  name: 'getEntryStepMetaData$'
})
export class GetEntryStepMetaDataPipe implements PipeTransform {

  transform(value: BlueprintEntry): Observable<BlueprintStepInfo|null> {
    if (value.type !== 'step') {
      return  of(null)
    }

    return of({
      name: 'todo to fill from state',
      hasSubSteps: [],
      label: 'The Label that will be shown on the UI'
    })
  }

}
