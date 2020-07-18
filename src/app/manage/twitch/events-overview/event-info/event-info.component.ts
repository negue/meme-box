import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Twitch} from "@memebox/contracts";

@Component({
  selector: 'app-event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.css']
})
export class EventInfoComponent implements OnInit {

  @Input()
  item: Twitch;

  @Output()
  onDelete = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
