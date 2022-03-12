import {Component, OnInit} from '@angular/core';
import {LogicContextState, LogicContextStateQuery, LogicVariable} from "@memebox/logic-step-core";
import {Observable} from "rxjs";

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
}
