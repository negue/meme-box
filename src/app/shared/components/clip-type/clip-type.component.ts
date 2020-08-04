import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-clip-type',
  templateUrl: './clip-type.component.html',
  styleUrls: ['./clip-type.component.css']
})
export class ClipTypeComponent {

  @Input()
  public type: number;

  constructor() {
  }

}
