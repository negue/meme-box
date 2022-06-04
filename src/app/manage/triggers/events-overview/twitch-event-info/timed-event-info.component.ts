import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TimedAction, TwitchTypesArray} from '@memebox/contracts';
import {AppQueries, AppService} from '@memebox/app-state';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-timed-info',
  templateUrl: './timed-event-info.component.html',
  styleUrls: ['./timed-event-info.component.scss']
})
export class TimedEventInfoComponent {
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
  public readonly onDelete = new EventEmitter<any>();

  @Output()
  public readonly onEdit = new EventEmitter<any>();

  constructor(private appQueries: AppQueries,
              private appService: AppService) {
  }

  onActiveChanged(): void  {
    this.appService.toggleTimedClipActiveState(this.item.id);
  }
}
