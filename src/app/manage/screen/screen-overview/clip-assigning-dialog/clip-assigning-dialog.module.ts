import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClipAssigningDialogComponent} from './clip-assigning-dialog/clip-assigning-dialog.component';
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";

// todo better name? :D


@NgModule({
  declarations: [ClipAssigningDialogComponent],
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
  ]
})
export class ClipAssigningDialogModule {
}
