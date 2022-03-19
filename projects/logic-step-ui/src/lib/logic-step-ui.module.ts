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
import {LogicMethodArgumentsPipe} from './logic-method-arguments.pipe';
import {MatTabsModule} from "@angular/material/tabs";
import {BlueprintEntryCallComponent} from './blueprint-entry-call/blueprint-entry-call.component';
import {BlueprintEntryGroupComponent} from './blueprint-entry-group/blueprint-entry-group.component';
import {BlueprintEntryComponent} from './blueprint-entry/blueprint-entry.component';
import {GetEntrySubStepInfoPipe} from './get-entry-sub-step-info.pipe';
import {GetEntryStepMetaDataPipe} from './get-entry-step-meta-data.pipe';

@NgModule({
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, DragDropModule, MatTabsModule],
  declarations: [
    LogicGroupComponent,
    LogicCallComponent,
    LogicEditorComponent,
    LogicVariableComponent,
    LogicStepMethodListPipe,
    LogicMethodArgumentsPipe,
    BlueprintEntryCallComponent,
    BlueprintEntryGroupComponent,
    BlueprintEntryComponent,
    GetEntrySubStepInfoPipe,
    GetEntryStepMetaDataPipe
  ],
  exports: [
    LogicEditorComponent
  ]
})
export class LogicStepUiModule {}
