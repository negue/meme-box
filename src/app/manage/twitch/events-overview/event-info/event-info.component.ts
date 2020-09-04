import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Twitch} from "@memebox/contracts";
import {AppQueries} from "../../../../state/app.queries";
import {map} from "rxjs/operators";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {AppService} from "../../../../state/app.service";

@Component({
  selector: 'app-event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss']
})
export class EventInfoComponent implements OnInit {

  @Input()
  item: Twitch;

  allInformations$ = this.appQueries.state$.pipe(
    map(value => {
      const clip = value.clips[this.item.clipId];
      // const screen = value.screen[this.item.screenId];

      return {
        clip,
        // screen
      };
    })
  )

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
    const newItem = {
      ...this.item,
      active: $event.checked
    }

    this.appService.addOrUpdateTwitchEvent(newItem);
  }
}
