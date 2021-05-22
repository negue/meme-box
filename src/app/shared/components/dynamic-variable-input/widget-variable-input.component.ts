import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DynamicIframeVariableTypes} from "@memebox/utils";

@Component({
  selector: 'app-widget-variable-input',
  templateUrl: './widget-variable-input.component.html',
  styleUrls: ['./widget-variable-input.component.scss']
})
export class WidgetVariableInputComponent implements OnInit {

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
