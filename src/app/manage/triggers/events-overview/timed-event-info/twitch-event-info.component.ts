import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Twitch, TwitchEventTypes, TwitchTypesArray} from '@memebox/contracts';
import {AppQueries} from '../../../../../../projects/app-state/src/lib/state/app.queries';
import {map} from 'rxjs/operators';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {AppService} from '../../../../../../projects/app-state/src/lib/state/app.service';

@Component({
  selector: 'app-twitch-info',
  templateUrl: './twitch-event-info.component.html',
  styleUrls: ['./twitch-event-info.component.scss']
})
export class TwitchEventInfoComponent implements OnInit {
  twitchEvents = TwitchTypesArray;
  @Input()
  item: Twitch;

  twitchEventTypes = TwitchEventTypes;

  allInformations$ = this.appQueries.state$.pipe(
    map(value => {
      const clip = value.clips[this.item.clipId];
      // const screen = value.screen[this.item.screenId];

      return {
        clip
        // screen
      };
    })
  );

  @Output()
  onDelete = new EventEmitter<any>();

  @Output()
  onEdit = new EventEmitter<any>();

  @Output()
  onPreview = new EventEmitter<any>();

  constructor(private appQueries: AppQueries,
              private appService: AppService) {
  }

  ngOnInit(): void {
  }

  onActiveChanged($event: MatCheckboxChange) {
    this.appService.toggleTwitchActiveState(this.item.id);
  }
}
