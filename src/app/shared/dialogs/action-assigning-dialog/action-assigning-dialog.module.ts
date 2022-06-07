import {NgModule} from "@angular/core";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {ActionAssigningDialogComponent, ActionAssigningDialogOptions} from "./action-assigning-dialog.component";
import {FilterModule} from "../../components/filter/filter.module";
import {ActionPreviewModule, ClipTypeModule} from "@memebox/state-components";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {UiComponentsPipesModule} from "@memebox/ui-components";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";

@NgModule({
  declarations: [
    ActionAssigningDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FilterModule,
    ClipTypeModule,
    MatIconModule,
    MatListModule,
    UiComponentsPipesModule,
    OpenFeedbackButtonModule,
    ActionPreviewModule,
  ],
  providers: [],
})
export class ActionAssigningDialogModule implements DialogContract<ActionAssigningDialogOptions> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: ActionAssigningDialogOptions): MatDialogRef<any> {
    const dialogRef = this.dialog.open(ActionAssigningDialogComponent, {
      data: payload,
      width: '800px',
      panelClass: ['max-height-dialog', 'dialog-without-right-padding'],
      autoFocus: false
    });

    return dialogRef;
  }
}
