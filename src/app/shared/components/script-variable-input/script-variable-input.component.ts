import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScriptVariableTypes} from "@memebox/utils";

@Component({
  selector: 'app-script-variable-input',
  templateUrl: './script-variable-input.component.html',
  styleUrls: ['./script-variable-input.component.scss']
})
export class ScriptVariableInputComponent implements OnInit {

  @Input()
  public variableType: ScriptVariableTypes;

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
