import {Pipe, PipeTransform} from '@angular/core';
import {BlueprintEntry, BlueprintStepInfo} from "@memebox/logic-step-core";
import {Observable, of} from "rxjs";
import {AppQueries} from "@memebox/app-state";
import {map, startWith} from "rxjs/operators";

@Pipe({
  name: 'getEntryStepMetaData$'
})
export class GetEntryStepMetaDataPipe implements PipeTransform {

  constructor (
    private appQueries: AppQueries
  ) {
  }

  transform(value: BlueprintEntry): Observable<BlueprintStepInfo|null> {
    if (value.entryType !== 'step') {
      return  of(null)
    }

    switch (value.stepType) {
      case "triggerAction": {
        return this.appQueries.getActionById$(value.payload.actionId+'').pipe(
          map(actionInfo => actionInfo?.name ?? 'unknown action'),
          startWith('unknown action'),

          map(actionInfo => {
            return {
              stepType: value.stepType,
              label: actionInfo,
            };
          })
        );
      }

      default:
        return of({
          stepType: value.stepType,
          label: 'unknown: '+value.stepType
        });
      }
  }

}
