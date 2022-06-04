import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionVariableConfig } from "@memebox/action-variables";

@Component({
  selector: 'app-variables-config',
  templateUrl: './variables-config.component.html',
  styleUrls: ['./variables-config.component.scss']
})
export class VariablesConfigComponent {

  @Input()
  public variablesList: ActionVariableConfig[] = [];

  @Input()
  public isWidgetVariableList = false;

  @Output()
  public readonly onAddNewVariable = new EventEmitter();

  @Output()
  public readonly onEditVariable = new EventEmitter<ActionVariableConfig>();

  @Output()
  public readonly onDeleteVariable = new EventEmitter<ActionVariableConfig>();
}
