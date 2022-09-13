import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ObsConnectionEditComponent} from './obs-connection-edit.component';
import {DialogContract} from "../dialog.contract";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";


@NgModule({
  declarations: [
    ObsConnectionEditComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class ObsConnectionEditModule implements DialogContract<void, ObsConnectionEditComponent> {
  constructor(private dialog: MatDialog) { }

  openDialog(): MatDialogRef<ObsConnectionEditComponent> {
    const dialogRef = this.dialog.open(ObsConnectionEditComponent, {

    });

    return dialogRef;
  }
}
