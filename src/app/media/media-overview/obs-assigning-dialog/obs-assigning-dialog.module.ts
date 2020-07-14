import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatListModule} from "@angular/material/list";
import {ObsAssigningDialogComponent} from "./obs-assigning-dialog/obs-assigning-dialog.component";

// todo better name? :D


@NgModule({
  declarations: [ObsAssigningDialogComponent],
  imports: [
    CommonModule,
    MatListModule
  ]
})
export class ObsAssigningDialogModule { }
