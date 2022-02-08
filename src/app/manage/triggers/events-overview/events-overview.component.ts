import {Component, OnInit, TrackByFunction} from '@angular/core';
import {ENDPOINTS, HasId, TimedAction, TwitchTrigger} from "@memebox/contracts";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {API_BASE, AppQueries, AppService} from "@memebox/app-state";
import {DialogService} from "../../../shared/dialogs/dialog.service";
import {HttpClient} from "@angular/common/http";
import {debounceTime, map, startWith} from "rxjs/operators";
import orderBy from 'lodash/orderBy';
import {convertTwitchEventConfigToTwitchEvent} from "./events-overview.functions";

@Component({
  selector: 'app-events-overview',
  templateUrl: './events-overview.component.html',
  styleUrls: ['./events-overview.component.scss']
})
export class EventsOverviewComponent implements OnInit {

  public searchText = '';
  public searchText$ = new BehaviorSubject<string>('');


  twitchEventsList$: Observable<TwitchTrigger[]> =
    combineLatest([
      this.queries.twitchEvents$.pipe(
       //  map(allEvents => orderBy(allEvents, e => e.name.toLowerCase()))
      ),
      this.queries.actionMap$,
      this.searchText$.pipe(
        debounceTime(300),
        map(searchText => searchText.toLowerCase()),
        startWith('')
      )
    ]).pipe(
      map(([allTwitchTriggers, actionMap, currentSearch]) => {
        if (!currentSearch) {
          return allTwitchTriggers;
        }

        return allTwitchTriggers.filter(t => {
          const actionOfTrigger = actionMap[t.clipId];

          if (actionOfTrigger.name.toLowerCase().includes(currentSearch)) {
            return true;
          }

          if (t.channelPointData?.title.toLowerCase().includes(currentSearch)) {
            return true;
          }

          if (t.contains.toLowerCase().includes(currentSearch)) {
            return true;
          }

          if (t.aliases) {
            if (t.aliases.some(a => a.includes(currentSearch))) {
              return true;
            }
          }

          return false;
        });
      })
    );


  timedEventsList$: Observable<TimedAction[]> = this.queries.timedEvents$.pipe(
    map(allTimers => orderBy(allTimers, 'everyXms'))
);
  twitchChannelExist$ = this.queries.config$.pipe(
    map(cfg => !!cfg.twitch.channel)
  );

  public trackById: TrackByFunction<HasId> = (index, item) => {
    return item.id;
  };

  constructor(private queries: AppQueries,
              private appService: AppService,
              private dialogService: DialogService,
              private http: HttpClient) {
  }

  ngOnInit(): void {
  }

  createNewTwitchCommand() {
    this.dialogService.showTwitchEditDialog(null);
  }
  createNewTimer() {
    this.dialogService.showTimedEditDialog(null);
  }

  deleteTwitchEvent(id: string) {
    this.appService.deleteTwitchEvent(id);
  }

  editTwitchEvent(twitchEventItem: TwitchTrigger) {
    this.dialogService.showTwitchEditDialog( twitchEventItem);
  }

  deleteTimedEvent(id: string) {
    this.appService.deleteTimedEvent(id);
  }

  editTimedEvent(twitchEventItem: TimedAction) {
    this.dialogService.showTimedEditDialog( twitchEventItem);
  }

  previewEvent(item: TwitchTrigger) {
    const badges = {};

    for(const role of item.roles ) {
      badges[role] = 1;
    }

    const twitchEventToTrigger = convertTwitchEventConfigToTwitchEvent(item, badges);

    this.http.post(`${API_BASE}${ENDPOINTS.TWITCH_EVENTS.PREFIX}${ENDPOINTS.TWITCH_EVENTS.TRIGGER_EVENT}`, twitchEventToTrigger)
      .toPromise();
  }

  openTwitchConfigs() {
    this.dialogService.openTwitchConnectionConfig();
  }

  updateSearchField(value: string) {
    this.searchText = value;
    this.searchText$.next(value);
  }
}
