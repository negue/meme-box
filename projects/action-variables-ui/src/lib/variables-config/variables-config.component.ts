import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActionVariableConfig} from "@memebox/action-variables";

@Component({
  selector: 'app-variables-config',
  templateUrl: './variables-config.component.html',
  styleUrls: ['./variables-config.component.scss']
})
export class VariablesConfigComponent implements OnInit {

  @Input()
  public variablesList: ActionVariableConfig[] = [];

  @Input()
  public isWidgetVariableList = false;

  @Output()
  public onAddNewVariable = new EventEmitter();

  @Output()
  public onEditVariable = new EventEmitter<ActionVariableConfig>();

  @Output()
  public onDeleteVariable = new EventEmitter<ActionVariableConfig>();

  constructor() { }

  ngOnInit(): void {
  }
}
