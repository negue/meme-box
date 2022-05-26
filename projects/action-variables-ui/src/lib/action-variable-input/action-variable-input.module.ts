import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionVariableInputComponent} from './action-variable-input.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {CompactClipCardModule} from "@memebox/state-components";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";


@NgModule({
  declarations: [
    ActionVariableInputComponent
  ],
  exports: [
    ActionVariableInputComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    CompactClipCardModule,
    MatSlideToggleModule
  ]
})
export class ActionVariableInputModule { }
