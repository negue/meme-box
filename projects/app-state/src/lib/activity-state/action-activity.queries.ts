import {Injectable} from "@angular/core";
import {Query} from "@datorama/akita";
import {ActivityStore} from "./activity.store";
import {isActionCurrently} from "@memebox/shared-state";
import {Observable} from "rxjs";
import {ActionStateEnum} from "@memebox/contracts";
import {ActivityState} from "./activity.types";

@Injectable({
  providedIn:'root'
})
export class ActivityQueries extends Query<ActivityState> {
  state$ = this.select().pipe(

  );

  constructor(protected store: ActivityStore) {
    super(store);
  }

  public isActionActive$(
    actionId: string,
    screenId?: string
  ): Observable<boolean> {
    return this.select(store => isActionCurrently(store.actionState, ActionStateEnum.Active, actionId, screenId))
  }

  public isScreenActive$(
    screenId: string
  ): Observable<boolean> {
    return this.select(store => store.screenState[screenId])
  }
}
