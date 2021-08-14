import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TimedClip, TwitchTypesArray} from '@memebox/contracts';
import {AppQueries} from '../../../../../../projects/app-state/src/lib/state/app.queries';
import {map} from 'rxjs/operators';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {AppService} from '../../../../../../projects/app-state/src/lib/state/app.service';

@Component({
  selector: 'app-timed-info',
  templateUrl: './timed-event-info.component.html',
  styleUrls: ['./timed-event-info.component.scss']
})
export class TimedEventInfoComponent implements OnInit {
  twitchEvents = TwitchTypesArray;
  @Input()
  item: TimedClip;


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

  onActiveChanged($event: MatCheckboxChange) {
    this.appService.toggleTimedClipActiveState(this.item.id);
  }
}
