import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TwitchConnectionEditComponent} from './twitch-connection-edit.component';
import {DialogContract} from "../dialog.contract";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTabsModule} from "@angular/material/tabs";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {PipesModule} from "@memebox/ui-components";
import {TranslocoModule} from "@ngneat/transloco";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";


@NgModule({
  declarations: [
    TwitchConnectionEditComponent
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    PipesModule,
    TranslocoModule,
    OpenFeedbackButtonModule
  ]
})
export class TwitchConnectionEditModule implements DialogContract<void> {
  constructor(private dialog: MatDialog) { }

  openDialog(): MatDialogRef<any> {
    const dialogRef = this.dialog.open(TwitchConnectionEditComponent, {

    });

    return dialogRef;
  }
}
