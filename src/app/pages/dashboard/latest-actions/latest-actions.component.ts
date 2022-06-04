import {Component} from '@angular/core';
import {API_BASE, AppQueries, MemeboxWebsocketService} from "@memebox/app-state";
import {HttpClient} from "@angular/common/http";
import {combineLatest, Observable} from "rxjs";
import {ENDPOINTS, TriggerActionDashboardEntry, TriggerActionOrigin} from "@memebox/contracts";
import {filter, map, startWith, switchMap} from "rxjs/operators";
import {takeLatestItems} from "@memebox/utils";

@Component({
  selector: 'app-latest-actions',
  templateUrl: './latest-actions.component.html',
  styleUrls: ['./latest-actions.component.scss']
})
export class LatestActionsComponent {


  public latestActions$: Observable<TriggerActionDashboardEntry[]>;

  constructor(
    private appQuery: AppQueries,
    private memeboxWS: MemeboxWebsocketService,

    private http: HttpClient
  ) {
    const latest20EventsFromServer$ = this.http.get<TriggerActionDashboardEntry[]>(`${API_BASE}${ENDPOINTS.ACTION.PREFIX}${ENDPOINTS.ACTION.LAST_20_ACTIONS}`);

    const currentLatest20Events$: Observable<TriggerActionDashboardEntry[]> = latest20EventsFromServer$.pipe(
      switchMap(latest20 =>
        this.memeboxWS.onTriggerAction$.pipe(
          takeLatestItems(20, latest20),
          startWith(latest20),
          map(items => [...items].reverse())
        )
      )
    );

    const filledActionMap$ = this.appQuery.actionMap$.pipe(
      filter(data => !!data && Object.keys(data).length > 0)
    );

    this.latestActions$ = combineLatest([
      currentLatest20Events$,
      filledActionMap$
    ]).pipe(
      map(([latest20, actionMap]) => {
        for (const latest20Element of latest20) {
          latest20Element.actionName = actionMap[latest20Element.id]?.name ?? 'Unknown';
          latest20Element.originTypeName = TriggerActionOrigin[latest20Element.origin];
        }

        return latest20;
      })
    );
  }
}
