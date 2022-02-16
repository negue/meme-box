import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CheckboxChipComponent} from './checkbox-chip.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatCheckboxModule} from "@angular/material/checkbox";


@NgModule({
  declarations: [
    CheckboxChipComponent
  ],
  imports: [
    CommonModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  exports: [
    CheckboxChipComponent
  ]
})
export class CheckboxChipModule { }
