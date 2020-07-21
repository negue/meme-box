import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClipTypeComponent} from './clip-type.component';
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [ClipTypeComponent],
  exports: [
    ClipTypeComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class ClipTypeModule { }
