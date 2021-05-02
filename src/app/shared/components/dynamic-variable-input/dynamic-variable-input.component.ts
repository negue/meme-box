import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DynamicIframeVariableTypes} from "@memebox/utils";

@Component({
  selector: 'app-dynamic-variable-input',
  templateUrl: './dynamic-variable-input.component.html',
  styleUrls: ['./dynamic-variable-input.component.scss']
})
export class DynamicVariableInputComponent implements OnInit {

  @Input()
  public variableType: DynamicIframeVariableTypes;

  @Input()
  public label: string;

  @Input()
  public value: any;

  @Output()
  public valueChanged = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
