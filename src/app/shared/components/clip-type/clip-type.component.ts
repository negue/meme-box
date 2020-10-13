import {Component, Input} from '@angular/core';
import {MEDIA_TYPE_INFORMATION} from "@memebox/contracts";

@Component({
  selector: 'app-clip-type',
  templateUrl: './clip-type.component.html',
  styleUrls: ['./clip-type.component.css']
})
export class ClipTypeComponent {

  public MediaInfoDictionary = MEDIA_TYPE_INFORMATION;

  @Input()
  public type: number;

  constructor() {
  }

}
