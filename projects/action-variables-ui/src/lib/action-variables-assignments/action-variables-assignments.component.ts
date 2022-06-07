import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dictionary } from "@memebox/contracts";
import { ActionVariableConfig, ActionVariableTypes } from "@memebox/action-variables";
import { MatCheckboxChange } from "@angular/material/checkbox";

@Component({
  selector: 'app-action-variables-assignments',
  templateUrl: './action-variables-assignments.component.html',
  styleUrls: ['./action-variables-assignments.component.scss']
})
export class ActionVariablesAssignmentsComponent {

  @Input()
  public data: Dictionary<unknown> = {};

  @Input()
  public fallbackData: Dictionary<string> = {};

  @Output()
  public readonly dataChanged = new EventEmitter<Dictionary<unknown>>();

  @Input()
  public variablesConfig: ActionVariableConfig[];

  variableChanged(name: string, valueType: ActionVariableTypes, $event: unknown): void  {
    const newDataObject = {
      ...this.data
    };

    switch (valueType) {
      case ActionVariableTypes.actionList:
      {
        newDataObject[name] = JSON.stringify($event);
        break;
      }
      default: {

        newDataObject[name] = typeof $event !== 'undefined'
          ? `${$event}`
          : undefined;
      }
    }


    this.dataChanged.next(newDataObject);
  }

  unsetValue($event: MatCheckboxChange, variable: ActionVariableConfig): void  {
    if ($event.checked) {
      return;
    }

    this.variableChanged(variable.name, variable.type, undefined)
  }
}
