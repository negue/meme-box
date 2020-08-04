import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatListModule} from "@angular/material/list";
import {ScreenAssigningDialogComponent} from "./screen-assigning-dialog/screen-assigning-dialog.component";
import {MatDialogModule} from "@angular/material/dialog";

// todo better name? :D


@NgModule({
  declarations: [ScreenAssigningDialogComponent],
  imports: [
    CommonModule,
    MatListModule,
    MatDialogModule
  ]
})
export class ScreenAssigningDialogModule {
}
