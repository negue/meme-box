import {Pipe, PipeTransform} from '@angular/core';
import {BlueprintEntry, BlueprintSubStepInfo} from "@memebox/logic-step-core";
import {Observable, of} from "rxjs";

@Pipe({
  name: 'getEntrySubStepInfo$'
})
export class GetEntrySubStepInfoPipe implements PipeTransform {

  transform(value: BlueprintEntry): Observable<BlueprintSubStepInfo[]> {
    switch (value.type) {
      case 'step':
        return of([]); // loading from metadata state
      case  'group':
        return of([
          {
            name: 'entries',
            label: 'Steps'
          }
        ]);
      case 'function':
        return of([
          {
            name: 'entries',
            label: 'Steps'
          }
        ]);
    }
  }
}
