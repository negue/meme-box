import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ObsViewEntry} from "@memebox/contracts";

@Component({
  selector: 'app-obs-info',
  templateUrl: './obs-info.component.html',
  styleUrls: ['./obs-info.component.css']
})
export class ObsInfoComponent implements OnInit {

  @Input()
  public info: ObsViewEntry;

  @Output()
  public onEdit = new EventEmitter();


  @Output()
  public onDelete = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
