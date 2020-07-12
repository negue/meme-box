import {Component, OnInit} from '@angular/core';
import {Twitch} from "@memebox/contracts";
import {Observable} from "rxjs";
import {AppQueries} from "../../state/app.queries";
import {AppService} from "../../state/app.service";

@Component({
  selector: 'app-events-overview',
  templateUrl: './events-overview.component.html',
  styleUrls: ['./events-overview.component.css']
})
export class EventsOverviewComponent implements OnInit {

  eventsList$: Observable<Twitch[]> = this.queries.twitchEvent$;

  constructor(private queries: AppQueries,
              private appService: AppService) { }

  ngOnInit(): void {
  }

  newEventConfigReceived($event: Twitch) {
    this.appService.addOrUpdateTwitchEvent($event);
  }

  deleteEvent(id: string) {
    this.appService.deleteTwitchEvent(id);
  }
}
