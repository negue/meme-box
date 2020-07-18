import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Clip} from "@memebox/contracts";

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent implements OnInit {

  @Input()
  public info: Clip;


  @Output()
  public onPreview = new EventEmitter();

  @Output()
  public onEdit = new EventEmitter();

  @Output()
  public onDelete = new EventEmitter();

  @Output()
  public onAssignObs = new EventEmitter();

  constructor(public domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }
}
