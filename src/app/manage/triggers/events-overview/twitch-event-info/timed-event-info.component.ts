import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TimedAction, TwitchTypesArray} from '@memebox/contracts';
import {AppQueries, AppService} from '@memebox/app-state';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-timed-info',
  templateUrl: './timed-event-info.component.html',
  styleUrls: ['./timed-event-info.component.scss']
})
export class TimedEventInfoComponent implements OnInit {
  twitchEvents = TwitchTypesArray;
  @Input()
  item: TimedAction;


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

  constructor(private appQueries: AppQueries,
              private appService: AppService) {
  }

  ngOnInit(): void {
  }

  onActiveChanged() {
    this.appService.toggleTimedClipActiveState(this.item.id);
  }
}
