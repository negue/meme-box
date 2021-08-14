import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AppQueries} from "@memebox/app-state";
import {filter, map} from "rxjs/operators";
import {combineLatest} from "rxjs";
import {ObservableInputs, SCRIPT_VARIABLES_KEY} from '@memebox/utils';
import {Dictionary} from "@memebox/contracts";
import {ActionVariableConfig} from "@memebox/action-variables";

@Component({
  selector: 'app-action-variables-assignments',
  templateUrl: './action-variables-assignments.component.html',
  styleUrls: ['./action-variables-assignments.component.scss']
})
export class ActionVariablesAssignmentsComponent implements OnInit, OnChanges {
  private readonly inputs = new ObservableInputs();

  @Input()
  public data: Dictionary<unknown> = {};

  @Output()
  public dataChanged = new EventEmitter<Record<string, unknown>>();

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
    map(action => JSON.parse(action.extended?.[SCRIPT_VARIABLES_KEY] ?? '[]') as ActionVariableConfig[])
  );

  constructor(
    private appQueries: AppQueries
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.inputs.onChanges();
  }

  variableChanged(name: string, value: unknown) {
    this.data[name] = value;

    this.dataChanged.next(this.data);
  }
}
