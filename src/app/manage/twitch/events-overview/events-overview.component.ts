import {Component, OnInit} from '@angular/core';
import {ENDPOINTS, Twitch, TwitchTriggerCommand} from "@memebox/contracts";
import {Observable} from "rxjs";
import {AppQueries} from "../../../state/app.queries";
import {API_BASE, AppService} from "../../../state/app.service";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-events-overview',
  templateUrl: './events-overview.component.html',
  styleUrls: ['./events-overview.component.css']
})
export class EventsOverviewComponent implements OnInit {

  eventsList$: Observable<Twitch[]> = this.queries.twitchEvent$;

  constructor(private queries: AppQueries,
              private appService: AppService,
              private dialogService: DialogService,
              private http: HttpClient) {
  }

  ngOnInit(): void {
  }

  newEventConfigReceived($event: Twitch) {
    this.appService.addOrUpdateTwitchEvent($event);
  }

  deleteEvent(id: string) {
    this.appService.deleteTwitchEvent(id);
  }

  editEvent(twitchEventItem: Twitch) {
    this.dialogService.showTwitchEditDialog( twitchEventItem);
  }

  previewEvent(item: Twitch) {
    const triggerObj: TwitchTriggerCommand = {
      event: item.event,
      message: item.contains
    }

    this.http.post(`${API_BASE}${ENDPOINTS.TWITCH_TRIGGER}`, triggerObj)
      .subscribe(value =>{
          // need result?
    })
  }
}
