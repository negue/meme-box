import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogService} from "./dialog.service";
import {MediaEditComponent} from "./media-edit/media-edit.component";
import {ScreenEditComponent} from "./screen-edit/screen-edit.component";
import {MatDialogModule} from "@angular/material/dialog";
import {SimpleConfirmationDialogComponent} from "./simple-confirmation-dialog/simple-confirmation-dialog.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {MatSliderModule} from "@angular/material/slider";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";


@NgModule({
  declarations: [
    MediaEditComponent,
    ScreenEditComponent,
    SimpleConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule,
  ],
  providers: [
    DialogService
  ]
})
export class DialogsModule { }
