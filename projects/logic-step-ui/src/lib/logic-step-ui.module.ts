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

@NgModule({
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  declarations: [
    LogicGroupComponent,
    LogicCallComponent,
    LogicEditorComponent,
    LogicVariableComponent
  ],
  exports: [
    LogicEditorComponent
  ]
})
export class LogicStepUiModule {}
