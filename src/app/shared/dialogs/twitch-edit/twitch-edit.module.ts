import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {TwitchTrigger} from "@memebox/contracts";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {ClipPreviewModule} from "@memebox/state-components";
import {TwitchEditComponent} from "./twitch-edit.component";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {PipesModule} from "@memebox/ui-components";
import {ActionVariablesAssignmentsModule} from "@memebox/action-variables/ui";
import {OpenActionSettingsButtonModule} from "../../components/open-action-settings-button/open-action-settings-button.module";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  declarations: [
    TwitchEditComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ClipPreviewModule,
    MatSelectModule,
    MatCheckboxModule,
    PipesModule,
    ActionVariablesAssignmentsModule,
    OpenActionSettingsButtonModule,
    OpenFeedbackButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  providers: [],
})
export class TwitchEditModule implements DialogContract<TwitchTrigger> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: TwitchTrigger): MatDialogRef<any> {
    const dialogRef = this.dialog.open(TwitchEditComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw',
      minHeight: '50vh'
    });

    return dialogRef;
  }
}
