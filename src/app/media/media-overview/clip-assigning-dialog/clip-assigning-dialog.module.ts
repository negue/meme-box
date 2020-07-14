import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClipAssigningDialogComponent} from './clip-assigning-dialog/clip-assigning-dialog.component';
import {MatListModule} from "@angular/material/list";

// todo better name? :D


@NgModule({
  declarations: [ClipAssigningDialogComponent],
  imports: [
    CommonModule,
    MatListModule
  ]
})
export class ClipAssigningDialogModule { }
