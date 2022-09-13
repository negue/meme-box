import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {TimedEditComponent} from "./timed-edit.component";
import {TimedAction} from "@memebox/contracts";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {ActionPreviewModule, StateBasedPipesModule} from "@memebox/state-components";
import {UiComponentsPipesModule} from "@memebox/ui-components";
import {MatSelectModule} from "@angular/material/select";
import {
  OpenActionSettingsButtonModule
} from "../../components/open-action-settings-button/open-action-settings-button.module";
import {ActionVariablesAssignmentsModule} from "@memebox/action-variables/ui";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";

@NgModule({
  declarations: [
    TimedEditComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ActionPreviewModule,
    UiComponentsPipesModule,
    MatSelectModule,
    OpenActionSettingsButtonModule,
    ActionVariablesAssignmentsModule,
    OpenFeedbackButtonModule,
    StateBasedPipesModule
  ],
  providers: [],
})
export class TimedEditModule implements DialogContract<TimedAction, TimedEditComponent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: TimedAction): MatDialogRef<TimedEditComponent> {
    const dialogRef = this.dialog.open(TimedEditComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw',
      minHeight: '50vh'
    });

    return dialogRef;
  }
}
