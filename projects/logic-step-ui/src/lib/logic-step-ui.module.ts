import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LogicGroupComponent} from './logic-group/logic-group.component';
import {LogicCallComponent} from './logic-call/logic-call.component';
import {LogicEditorComponent} from './logic-editor/logic-editor.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    LogicGroupComponent,
    LogicCallComponent,
    LogicEditorComponent
  ],
  exports: [
    LogicEditorComponent
  ]
})
export class LogicStepUiModule {}
