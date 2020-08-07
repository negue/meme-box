import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClipAssigningDialogComponent} from './clip-assigning-dialog/clip-assigning-dialog.component';
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatChipsModule} from "@angular/material/chips";

// todo better name? :D


@NgModule({
  declarations: [ClipAssigningDialogComponent],
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
  ]
})
export class ClipAssigningDialogModule {
}
