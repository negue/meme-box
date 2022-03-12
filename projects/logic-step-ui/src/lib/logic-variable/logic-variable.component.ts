import {Component, Input} from '@angular/core';
import {LogicVariable} from "@memebox/logic-step-core";
import {LogicEditorComponent} from "../logic-editor/logic-editor.component";

@Component({
  selector: 'logic-variable',
  templateUrl: './logic-variable.component.html',
  styleUrls: ['./logic-variable.component.css']
})
export class LogicVariableComponent {
  allTypes$ = this.logicEditor.logicQueries.allPossibleTypes$;

  @Input()
  public variable!: LogicVariable;

  constructor(
    private logicEditor: LogicEditorComponent
  ) { }

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
  }

  removeVariable() {
    this.logicEditor.state.deleteVariable(this.variable.id);
  }
}
