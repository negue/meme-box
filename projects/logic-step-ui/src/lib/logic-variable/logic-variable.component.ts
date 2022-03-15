import {Component, Input, OnInit} from '@angular/core';
import {LogicContextMetadataQuery, LogicVariable} from "@memebox/logic-step-core";
import {LogicEditorComponent} from "../logic-editor/logic-editor.component";
import {BehaviorSubject} from "rxjs";
import {switchMap} from "rxjs/operators";

@Component({
  selector: 'logic-variable',
  templateUrl: './logic-variable.component.html',
  styleUrls: ['./logic-variable.component.css']
})
export class LogicVariableComponent implements OnInit {
  private activeType$ = new BehaviorSubject<string>('');

  allTypes$ = this.logicEditor.logicQueries.allPossibleTypes$;

  typeMetaData$ = this.activeType$.pipe(
    switchMap(typeAsString => this.logicContextMetadata.getTypeMetadata$(typeAsString))
  );

  @Input()
  public variable!: LogicVariable;

  constructor(
    private logicEditor: LogicEditorComponent,
    private logicContextMetadata: LogicContextMetadataQuery
  ) { }

  ngOnInit(): void {
    this.activeType$.next(this.variable.typeName);
  }

  updateName(value: string) {
    this.logicEditor.state.updateVariable({
      ...this.variable,
      name: value
    });
  }

  updateType(value: string) {
    this.logicEditor.state.updateVariable({
      ...this.variable,
      typeName: value
    });

    this.activeType$.next(value);
  }


  updateSettingPayload(key: string, value: string) {
    this.logicEditor.state.updateVariable({
      ...this.variable,
      payload: {
        ...this.variable.payload,
        [key]: value
      }
    });

    this.activeType$.next(value);
  }


  removeVariable() {
    this.logicEditor.state.deleteVariable(this.variable.id);
  }
}
