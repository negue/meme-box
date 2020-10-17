import {Component, OnInit, TrackByFunction} from '@angular/core';
import {ENDPOINTS, HasId, Twitch, TwitchTriggerCommand} from "@memebox/contracts";
import {Observable} from "rxjs";
import {AppQueries} from "../../../state/app.queries";
import {API_BASE, AppService} from "../../../state/app.service";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/internal/operators";

@Component({
  selector: 'app-events-overview',
  templateUrl: './events-overview.component.html',
  styleUrls: ['./events-overview.component.scss']
})
export class EventsOverviewComponent implements OnInit {

  eventsList$: Observable<Twitch[]> = this.queries.twitchEvent$;
  twitchChannelExist$ = this.queries.config$.pipe(
    map(cfg => !!cfg.twitchChannel)
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

  newEventConfigReceived() {
    this.dialogService.showTwitchEditDialog(null);
  }

  deleteEvent(id: string) {
    this.appService.deleteTwitchEvent(id);
  }

  editEvent(twitchEventItem: Twitch) {
    this.dialogService.showTwitchEditDialog( twitchEventItem);
  }

  previewEvent(item: Twitch) {
    // TODO custom payload to trigger it and set the command on the server part
    const triggerObj: TwitchTriggerCommand = {
      //event: item.event,
      command: item,
      message: item.contains
    };

    this.http.post(`${API_BASE}${ENDPOINTS.TWITCH_TRIGGER}`, triggerObj)
      .subscribe(value =>{
          // need result?
    })
  }
}
