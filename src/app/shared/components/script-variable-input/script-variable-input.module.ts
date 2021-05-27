import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScriptVariableInputComponent} from './script-variable-input.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";


@NgModule({
  declarations: [
    ScriptVariableInputComponent
  ],
  exports: [
    ScriptVariableInputComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule
  ]
})
export class ScriptVariableInputModule { }
