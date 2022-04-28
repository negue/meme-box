import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StepSettingDialogComponent, StepSettingDialogPayload} from './step-setting-dialog.component';
import {DialogContract} from "../../../../../src/app/shared/dialogs/dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MatButtonModule} from "@angular/material/button";
import {ActionPreviewModule} from "@memebox/state-components";
import {ActionVariableInputModule, ActionVariablesAssignmentsModule} from "@memebox/action-variables/ui";
import {ActionVariableConfigPipe} from './action-variable-config.pipe';
import {
  OpenFeedbackButtonModule
} from "../../../../../src/app/shared/components/open-feedback-button/open-feedback-button.module";

// todo extract this module to its own internal library ^

@NgModule({
  declarations: [
    StepSettingDialogComponent,
    ActionVariableConfigPipe
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    ActionPreviewModule,
    ActionVariablesAssignmentsModule,
    MatDialogModule,
    OpenFeedbackButtonModule,
    ActionVariableInputModule
  ]
})
export class StepSettingDialogModule implements DialogContract<StepSettingDialogPayload> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: StepSettingDialogPayload): MatDialogRef<any> {
    const dialogRef = this.dialog.open(StepSettingDialogComponent, {
      data: payload,
    //  width: 'calc(min(1100px, 96%))',
    //  maxWidth: '96vw'
    });

    return dialogRef;
  }
}
