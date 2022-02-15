import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-checkbox-chip',
  templateUrl: './checkbox-chip.component.html',
  styleUrls: ['./checkbox-chip.component.scss']
})
export class CheckboxChipComponent implements OnInit {
  @Input()
  public checked = false;

  @Output()
  public checkedChange = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
