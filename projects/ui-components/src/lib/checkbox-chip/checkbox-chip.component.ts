import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox-chip',
  templateUrl: './checkbox-chip.component.html',
  styleUrls: ['./checkbox-chip.component.scss']
})
export class CheckboxChipComponent {
  @Input()
  public checked = false;

  @Output()
  public readonly checkedChange = new EventEmitter();
}
