import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {Twitch} from "@memebox/contracts";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {ClipPreviewModule} from "../../../../../projects/state-components/src/lib/clip-preview/clip-preview.module";
import {TwitchEditComponent} from "./twitch-edit.component";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {PipesModule} from "../../../../../projects/ui-components/src/lib/pipes/pipes.module";
import {ActionVariablesAssignmentsModule} from "../../../../../projects/action-variables-ui/src/lib/action-variables-assignments/action-variables-assignments.module";

@NgModule({
  declarations: [
    TwitchEditComponent
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
  ],
  providers: [],
})
export class TwitchEditModule implements DialogContract<Twitch> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: Twitch): MatDialogRef<any> {
    const dialogRef = this.dialog.open(TwitchEditComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw',
      minHeight: '50vh'
    });

    return dialogRef;
  }
}
