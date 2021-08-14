import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AppQueries} from "@memebox/app-state";
import {filter, map} from "rxjs/operators";
import {combineLatest} from "rxjs";
import {ObservableInputs} from '@memebox/utils';
import {Dictionary} from "@memebox/contracts";
import {ActionVariableTypes, getVariablesListOfAction} from "@memebox/action-variables";

@Component({
  selector: 'app-action-variables-assignments',
  templateUrl: './action-variables-assignments.component.html',
  styleUrls: ['./action-variables-assignments.component.scss']
})
export class ActionVariablesAssignmentsComponent implements OnInit, OnChanges {
  private readonly inputs = new ObservableInputs();

  @Input()
  public data: Dictionary<string> = {};

  @Output()
  public dataChanged = new EventEmitter<Dictionary<string>>();

  @Input()
  public actionId: string;
  actionId$ = this.inputs.observe(() => this.actionId);

  action$ = combineLatest([
    this.actionId$,
    this.appQueries.clipMap$
  ]).pipe(
    map(([actionId, clipMap]) => clipMap[actionId]),
    filter(action => !!action)
  );

  variablesConfig$ = this.action$.pipe(
    map(action => getVariablesListOfAction(action))
  );

  constructor(
    private appQueries: AppQueries
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.inputs.onChanges();
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
