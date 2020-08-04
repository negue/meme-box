import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Twitch} from "@memebox/contracts";
import {AppQueries} from "../../../../state/app.queries";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.css']
})
export class EventInfoComponent implements OnInit {

  @Input()
  item: Twitch;

  allInformations$ = this.appQueries.state$.pipe(
    map(value => {
      const clip = value.clips[this.item.clipId];
      const screen = value.screen[this.item.screenId];

      return {
        clip,
        screen
      };
    })
  )

  @Output()
  onDelete = new EventEmitter<any>();

  @Output()
  onEdit = new EventEmitter<any>();

  constructor(private appQueries: AppQueries) {
  }

  ngOnInit(): void {
  }

}
