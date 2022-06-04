import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommandSettingDialogPayload, StepSettingDialogComponent} from './step-setting-dialog.component';
import {DialogContract} from "../../../../../src/app/shared/dialogs/dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MatButtonModule} from "@angular/material/button";
import {ActionPreviewModule, ClipTypeModule, StateBasedPipesModule} from "@memebox/state-components";
import {ActionVariableInputModule, ActionVariablesAssignmentsModule} from "@memebox/action-variables/ui";
import {ActionVariableConfigPipe} from './action-variable-config.pipe';
import {
  OpenFeedbackButtonModule
} from "../../../../../src/app/shared/components/open-feedback-button/open-feedback-button.module";
import {ObsSceneSelectionComponent} from './obs-scene-selection/obs-scene-selection.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ObsFilterSelectionComponent} from './obs-filter-selection/obs-filter-selection.component';
import {UiComponentsPipesModule} from "@memebox/ui-components";
import {MatSelectModule} from "@angular/material/select";
import {ActionSelectionComponent} from './action-selection/action-selection.component';

// todo extract this module to its own internal library ^

@NgModule({
  declarations: [
    StepSettingDialogComponent,
    ActionVariableConfigPipe,
    ObsSceneSelectionComponent,
    ObsFilterSelectionComponent,
    ActionSelectionComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    ActionPreviewModule,
    ActionVariablesAssignmentsModule,
    MatDialogModule,
    OpenFeedbackButtonModule,
    ActionVariableInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    UiComponentsPipesModule,
    StateBasedPipesModule,
    MatSelectModule,
    ClipTypeModule
  ]
})
export class CommandSettingDialogModule implements DialogContract<CommandSettingDialogPayload> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: CommandSettingDialogPayload): MatDialogRef<any> {
    const dialogRef = this.dialog.open(StepSettingDialogComponent, {
      data: payload,
      autoFocus: false,
    //  width: 'calc(min(1100px, 96%))',
    //  maxWidth: '96vw'
    });

    return dialogRef;
  }
}
