import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionVariablesAssignmentsComponent} from './action-variables-assignments.component';
import {ActionVariableInputModule} from "../action-variable-input/action-variable-input.module";


@NgModule({
  declarations: [
    ActionVariablesAssignmentsComponent
  ],
  exports: [
    ActionVariablesAssignmentsComponent
  ],
  imports: [
    CommonModule,
    ActionVariableInputModule
  ]
})
export class ActionVariablesAssignmentsModule { }
