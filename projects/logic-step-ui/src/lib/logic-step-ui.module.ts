import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LogicGroupComponent} from './logic-group/logic-group.component';
import {LogicCallComponent} from './logic-call/logic-call.component';
import {LogicEditorComponent} from './logic-editor/logic-editor.component';
import {LogicVariableComponent} from './logic-variable/logic-variable.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {LogicStepMethodListPipe} from "./logic-step-method-list.pipe";

@NgModule({
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, DragDropModule],
  declarations: [
    LogicGroupComponent,
    LogicCallComponent,
    LogicEditorComponent,
    LogicVariableComponent,
    LogicStepMethodListPipe
  ],
  exports: [
    LogicEditorComponent
  ]
})
export class LogicStepUiModule {}
