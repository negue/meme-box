import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {LogicStepCall, LogicStepGroup, LogicVariable} from "@memebox/logic-step-core";
import {Observable} from "rxjs";
import {guid} from "@datorama/akita";
import {map} from "rxjs/operators";
import {LogicContextState, LogicContextStateQuery} from "../logic-context-state.service";

@Component({
  selector: 'logic-editor',
  templateUrl: './logic-editor.component.html',
  styleUrls: ['./logic-editor.component.css']
})
export class LogicEditorComponent implements  OnInit {
  public generatedCode$!: Observable<string>;

  public allVariableNames$ = this.logicQueries.allVariables$.pipe(
    map(variableAr => variableAr.map(variable => variable.name))
  );

  @Input()
  editorActionPanelTemplate!: TemplateRef<unknown>;

  constructor(
    public state: LogicContextState,
    public logicQueries: LogicContextStateQuery
  ) { }

  public registerGlobalVariables(...variablesToRegister: LogicVariable[]) {
    this.state.registerVariables(...variablesToRegister)
  }

  ngOnInit(): void {
    this.generatedCode$ = this.logicQueries.generatedSourceCode$;
  }

  addVariable(variablePayload: LogicVariable|null = null) {
    this.state.registerVariables(variablePayload ?? new LogicVariable('newVar', 'actionApi'))
  }

  addStep(parent: LogicStepGroup|null) {
    this.state.addStep({
      id: guid(),
      stepVariableName: '',
      logicStepType: "step",
      methodToCall: '',
      callbackSteps: [],
      methodArguments: {}
    }, parent);
  }

  addGroup(parent: LogicStepGroup|null) {
    this.state.addGroup({
      id: guid(),
      logicStepType: "group",
      steps: [],
      awaited: true
    }, parent)
  }

  updateStepVariableName(step: LogicStepCall, value: string, parent: LogicStepGroup|null) {
    this.state.updateCallStep({
      ...step,
      stepVariableName: value
    }, parent);
  }

  updateMethodToCall(step: LogicStepCall, value: string, parent: LogicStepGroup|null) {
    this.state.updateCallStep({
      ...step,
      methodToCall: value
    }, parent);
  }

  updateMethodArgument(step: LogicStepCall,
                       argumentName: string,
                       value: unknown,
                       parent: LogicStepGroup|null) {
    this.state.updateCallStep({
      ...step,
      methodArguments: {
        ...step.methodArguments,
        [argumentName]: value
      },
    }, parent);
  }
}
