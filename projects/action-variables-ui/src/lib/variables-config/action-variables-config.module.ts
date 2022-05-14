import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionVariableInputModule} from "../action-variable-input/action-variable-input.module";
import {UiComponentsPipesModule} from "@memebox/ui-components";
import {VariablesConfigComponent} from "./variables-config.component";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    VariablesConfigComponent
  ],
  exports: [
    VariablesConfigComponent
  ],
  imports: [
    CommonModule,
    UiComponentsPipesModule,
    ActionVariableInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ]
})
export class ActionVariablesConfigModule { }
