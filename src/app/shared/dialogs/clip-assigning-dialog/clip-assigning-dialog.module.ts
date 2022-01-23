import {NgModule} from "@angular/core";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {ClipAssigningDialogComponent, ClipAssigningDialogOptions} from "./clip-assigning-dialog.component";
import {FilterModule} from "../../components/filter/filter.module";
import {ClipTypeModule} from "@memebox/state-components";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {PipesModule} from "@memebox/ui-components";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";

@NgModule({
  declarations: [
    ClipAssigningDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FilterModule,
    ClipTypeModule,
    MatIconModule,
    MatListModule,
    PipesModule,
    OpenFeedbackButtonModule

  ],
  providers: [],
})
export class ClipAssigningDialogModule implements DialogContract<ClipAssigningDialogOptions> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: ClipAssigningDialogOptions): MatDialogRef<any> {
    const dialogRef = this.dialog.open(ClipAssigningDialogComponent, {
      data: payload,
      width: '800px',
      panelClass: ['max-height-dialog', 'dialog-without-right-padding'],
      autoFocus: false
    });

    return dialogRef;
  }
}
