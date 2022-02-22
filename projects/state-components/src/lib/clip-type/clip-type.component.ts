import {Component, HostBinding, Input} from '@angular/core';
import {ACTION_TYPE_INFORMATION} from "@memebox/contracts";

@Component({
  selector: 'app-clip-type',
  templateUrl: './clip-type.component.html',
  styleUrls: ['./clip-type.component.scss']
})
export class ClipTypeComponent {

  public MediaInfoDictionary = ACTION_TYPE_INFORMATION;

  @Input()
  public type: number;

  @HostBinding('style.--icon-size')
  @Input()
  public iconSize = '24px';

  constructor() {
  }

}
