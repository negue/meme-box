import {Pipe, PipeTransform} from '@angular/core';
import {Action, Screen} from "@memebox/contracts";
import {Observable} from "rxjs";
import {AppQueries} from "@memebox/app-state";
import {map} from "rxjs/operators";

@Pipe({
  name: 'actionScreenList$'
})
export class ActionScreenListPipe implements PipeTransform {
  constructor(
    private appQuery: AppQueries,
  ) {
  }

  transform(action: Action): Observable<Screen[]> {
    return this.appQuery.screensList$.pipe(
      map(screenList => screenList.filter(screen => !!screen.clips[action.id]))
    );
  }
}
