import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TwitchEventTypes, TwitchTrigger, TwitchTypesArray} from '@memebox/contracts';
import {AppQueries, AppService} from '@memebox/app-state';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-twitch-info',
  templateUrl: './twitch-event-info.component.html',
  styleUrls: ['./twitch-event-info.component.scss']
})
export class TwitchEventInfoComponent implements OnInit {
  twitchEvents = TwitchTypesArray;
  @Input()
  item: TwitchTrigger;

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

  menuIsOpened = false;

  constructor(private appQueries: AppQueries,
              private appService: AppService) {
  }

  ngOnInit(): void {
  }

  onActiveChanged() {
    this.appService.toggleTwitchActiveState(this.item.id);
  }
}
