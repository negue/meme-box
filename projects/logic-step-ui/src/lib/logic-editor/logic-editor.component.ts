import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  TrackByFunction
} from '@angular/core';
import {LogicStepCall, LogicStepGroup, LogicTypeMethodArgument, LogicVariable} from "@memebox/logic-step-core";
import {Observable, Subscription} from "rxjs";
import {guid} from "@datorama/akita";
import {map, skip} from "rxjs/operators";
import {LogicContextState, LogicContextStateQuery} from "../logic-context-state.service";

@Component({
  selector: 'logic-editor',
  templateUrl: './logic-editor.component.html',
  styleUrls: ['./logic-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogicEditorComponent implements OnInit, OnDestroy {
  private subMethodArgumentContextCache: {[key: string]: LogicContextState} = {};
  private stateSubscriptionCache: {[key: string]: Subscription} = {};

  public generatedCode$!: Observable<string>;

  public allVariableNames$ = this.logicQueries.allVariables$.pipe(
    map(variableAr => variableAr.map(variable => variable.name))
  );

  @Output()
  public init = new EventEmitter<void>();

  @Output()
  public destroyed = new EventEmitter<void>();

  @Input()
  editorActionPanelTemplate!: TemplateRef<unknown>;

  trackByMethodArgument: TrackByFunction<LogicTypeMethodArgument> = (index, item) => {
    return item.name;
  };

  constructor(
    public state: LogicContextState,
    public logicQueries: LogicContextStateQuery
  ) { }

  public registerGlobalVariables(...variablesToRegister: LogicVariable[]) {
    this.state.registerVariables(...variablesToRegister)
  }

  ngOnInit(): void {
    this.generatedCode$ = this.logicQueries.generatedSourceCode$;

    this.init.emit();
  }

  ngOnDestroy(): void {
    this.destroyed.emit();
  }

  addVariable(variablePayload: LogicVariable|null = null) {
    this.state.registerVariables(variablePayload ?? new LogicVariable('newVar', 'actionApi'))
  }

  addStep(parent: LogicStepGroup|null, state: LogicContextState) {
    state.addStep({
      id: guid(),
      stepVariableName: '',
      logicStepType: "step",
      methodToCall: '',
      callbackSteps: {},
      methodArguments: {}
    }, parent);
  }

  addGroup(parent: LogicStepGroup|null, state: LogicContextState) {
    state.addGroup({
      id: guid(),
      logicStepType: "group",
      steps: [],
      awaited: true
    }, parent)
  }

  updateStepVariableName(step: LogicStepCall, value: string,
                         parent: LogicStepGroup|null, state: LogicContextState) {
    state.updateCallStep({
      ...step,
      stepVariableName: value
    }, parent);
  }

  updateMethodToCall(step: LogicStepCall, value: string,
                     parent: LogicStepGroup|null, state: LogicContextState) {
    this.unsubscribeStepArgumentContext(step.id);

    state.updateCallStep({
      ...step,
      methodToCall: value
    }, parent);
  }

  updateMethodArgument(step: LogicStepCall,
                       argumentName: string,
                       value: unknown,
                       parent: LogicStepGroup|null,
                       state: LogicContextState) {
    state.updateCallStep({
      ...step,
      methodArguments: {
        ...step.methodArguments,
        [argumentName]: value
      },
    }, parent);
  }

  getContext(step: LogicStepCall, methodArgumentName: string,
             parent: LogicStepGroup|null, realState: LogicContextState): LogicContextState {
    const cacheKey = `${step.id}_${step.methodToCall}_${methodArgumentName}`;

    if (this.subMethodArgumentContextCache[cacheKey]) {
      return this.subMethodArgumentContextCache[cacheKey];
    }

    const callbackSteps = step.callbackSteps[methodArgumentName] ?? [];

    console.info('getContext', {
      step, methodArgumentName
    });

    const context =  new LogicContextState();

    context.update(state => {
      state.steps = [...callbackSteps];
    });

    this.stateSubscriptionCache[cacheKey] = context._select(state => state.steps)
      .pipe(
        skip(1)
      )
      .subscribe(newSteps => {
        realState.updateCallStep({
          ...step,
          callbackSteps: {
            ...step.callbackSteps,
            [methodArgumentName]: newSteps
          }
        }, parent)
      })

    this.subMethodArgumentContextCache[cacheKey] = context;

    return context;
  }

  removeStep(step: LogicStepCall) {

    this.unsubscribeStepArgumentContext(step.id);
  }

  unsubscribeStepArgumentContext(keyToSearch: string){
    for (const [cacheKey, subscription] of Object.entries(this.stateSubscriptionCache)) {
      if (!cacheKey.includes(keyToSearch)) {
        continue;
      }

      subscription.unsubscribe();
    }

    // todo delete the state context cache aswell
  }
}
