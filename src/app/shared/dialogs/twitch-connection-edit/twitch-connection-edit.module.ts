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
import {UiComponentsPipesModule} from "@memebox/ui-components";
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
    UiComponentsPipesModule,
    TranslocoModule,
    OpenFeedbackButtonModule
  ]
})
export class TwitchConnectionEditModule implements DialogContract<void, TwitchConnectionEditComponent> {
  constructor(private dialog: MatDialog) { }

  openDialog(): MatDialogRef<TwitchConnectionEditComponent> {
    const dialogRef = this.dialog.open(TwitchConnectionEditComponent, {

    });

    return dialogRef;
  }
}
