import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Dictionary} from "@memebox/contracts";
import {ActionVariableConfig, ActionVariableTypes} from "@memebox/action-variables";

@Component({
  selector: 'app-action-variables-assignments',
  templateUrl: './action-variables-assignments.component.html',
  styleUrls: ['./action-variables-assignments.component.scss']
})
export class ActionVariablesAssignmentsComponent implements OnInit {

  @Input()
  public data: Dictionary<string> = {};

  @Output()
  public dataChanged = new EventEmitter<Dictionary<string>>();

  @Input()
  public variablesConfig: ActionVariableConfig[];

  constructor() { }

  ngOnInit(): void {
  }

  variableChanged(name: string, valueType: ActionVariableTypes, $event: unknown) {
    const newDataObject = {
      ...this.data
    };

    switch (valueType) {
      case ActionVariableTypes.actionList:
      {
        newDataObject[name] = JSON.stringify($event);
      }
      default: {

        newDataObject[name] = $event+'';
      }
    }


    this.dataChanged.next(newDataObject);
  }
}
