import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MatButtonModule} from "@angular/material/button";
import {TriggerActionVariablesComponent} from "./trigger-action-variables.component";
import {ActionVariablesAssignmentsModule} from "@memebox/action-variables/ui";
import {Action} from "@memebox/contracts";

@NgModule({
  declarations: [
    TriggerActionVariablesComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    ActionVariablesAssignmentsModule,
    MatButtonModule
  ],
  providers: [],
})
export class TriggerActionVariablesDialogModule implements DialogContract<Action, TriggerActionVariablesComponent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: Action): MatDialogRef<TriggerActionVariablesComponent> {
    const dialogRef = this.dialog.open(TriggerActionVariablesComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw'
    });

    return dialogRef;
  }
}
