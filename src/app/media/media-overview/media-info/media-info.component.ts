import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Clip} from "../../../../../projects/contracts/src/lib/types";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent implements OnInit {

  @Input()
  public info: Clip;


  @Output()
  public preview = new EventEmitter();

  @Output()
  public edit = new EventEmitter();

  @Output()
  public delete = new EventEmitter();

  constructor(public domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }
}
