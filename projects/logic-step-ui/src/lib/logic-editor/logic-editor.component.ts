import {Component, OnInit} from '@angular/core';
import {LogicContextState, LogicContextStateQuery, LogicStepGroup, LogicVariable} from "@memebox/logic-step-core";
import {Observable} from "rxjs";
import {guid} from "@datorama/akita";

@Component({
  selector: 'logic-editor',
  templateUrl: './logic-editor.component.html',
  styleUrls: ['./logic-editor.component.css']
})
export class LogicEditorComponent implements  OnInit {
  public generatedCode$!: Observable<string>;

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

  addVariable() {
    this.state.registerVariables(new LogicVariable('newVar', 'actionApi'))
  }

  addStep(parent: LogicStepGroup|null) {
    this.state.addStep({
      id: guid(),
      stepVariableName: '',
      logicStepType: "step",
      methodToCall: ''
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
}
