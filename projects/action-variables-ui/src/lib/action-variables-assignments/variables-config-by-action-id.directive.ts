import {Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ObservableInputs} from "@memebox/utils";
import {combineLatest, Subject} from "rxjs";
import {filter, map, takeUntil} from "rxjs/operators";
import {getVariablesListOfAction} from "@memebox/action-variables";
import {AppQueries} from "@memebox/app-state";
import {ActionVariablesAssignmentsComponent} from "./action-variables-assignments.component";

@Directive({
  selector: 'app-action-variables-assignments[appVariablesConfigByActionId]'
})
export class VariablesConfigByActionIdDirective implements OnInit, OnDestroy, OnChanges {
  private readonly inputs = new ObservableInputs();
  private _destroy$ = new Subject();

  @Input()
  appVariablesConfigByActionId: string;

  actionId$ = this.inputs.observe(() => this.appVariablesConfigByActionId);

  action$ = combineLatest([
    this.actionId$,
    this.appQueries.actionMap$
  ]).pipe(
    map(([actionId, clipMap]) => clipMap[actionId]),
    filter(action => !!action)
  );

  variablesConfig$ = this.action$.pipe(
    map(action => getVariablesListOfAction(action))
  );

  constructor(
    private appQueries: AppQueries,
    private component: ActionVariablesAssignmentsComponent
  ) { }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngOnInit(): void {
    this.variablesConfig$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(variablesConfig => {
      this.component.variablesConfig = variablesConfig;
    })
    }

  ngOnChanges(changes: SimpleChanges): void  {
    this.inputs.onChanges();
  }
}
