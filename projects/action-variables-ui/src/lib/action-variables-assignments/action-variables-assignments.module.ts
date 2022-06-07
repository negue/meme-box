import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionVariablesAssignmentsComponent} from './action-variables-assignments.component';
import {ActionVariableInputModule} from "../action-variable-input/action-variable-input.module";
import {UiComponentsPipesModule} from "@memebox/ui-components";
import {VariablesConfigByActionIdDirective} from './variables-config-by-action-id.directive';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {VariableValueOrFallbackPipe} from './variable-value-or-fallback.pipe';
import {IsUndefinedPipe} from './is-undefined.pipe';
import {MatInputModule} from "@angular/material/input";


@NgModule({
  declarations: [
    ActionVariablesAssignmentsComponent,
    VariablesConfigByActionIdDirective,
    VariableValueOrFallbackPipe,
    IsUndefinedPipe
  ],
  exports: [
    ActionVariablesAssignmentsComponent,

    VariablesConfigByActionIdDirective
  ],
  imports: [
    CommonModule,
    ActionVariableInputModule,
    UiComponentsPipesModule,
    MatCheckboxModule,
    MatInputModule
  ]
})
export class ActionVariablesAssignmentsModule { }
