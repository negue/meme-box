import {Component, HostBinding, Input} from '@angular/core';
import {ACTION_TYPE_INFORMATION} from "@memebox/contracts";

@Component({
  selector: 'app-action-type',
  templateUrl: './action-type-icon.component.html',
  styleUrls: ['./action-type-icon.component.scss']
})
export class ActionTypeIconComponent {

  public MediaInfoDictionary = ACTION_TYPE_INFORMATION;

  @Input()
  public type: number;

  @HostBinding('style.--icon-size')
  @Input()
  public iconSize = '24px';

  constructor() {
  }

}
