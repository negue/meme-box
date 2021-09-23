import {Injectable} from "@angular/core";
import {Query} from "@datorama/akita";
import {ActivityStore} from "./activity.store";
import {ActionStateEntries, isActionCurrently} from "@memebox/shared-state";
import {Observable} from "rxjs";
import {ActionStateEnum} from "@memebox/contracts";

@Injectable({
  providedIn:'root'
})
export class ActivityQueries extends Query<ActionStateEntries> {
  state$ = this.select().pipe(

  );



  constructor(protected store: ActivityStore) {
    super(store);
  }

  public isActive$(
    actionId: string,
    screenId?: string
  ): Observable<boolean> {
    return this.select(store => isActionCurrently(store, ActionStateEnum.Active, actionId, screenId))
  }
}
