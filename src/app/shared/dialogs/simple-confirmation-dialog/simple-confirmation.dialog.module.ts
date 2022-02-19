import {NgModule} from "@angular/core";
import {ConfirmationsPayload, SimpleConfirmationDialogComponent} from "./simple-confirmation-dialog.component";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";

@NgModule({
  declarations: [
    SimpleConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule

  ],
  providers: [],
})
export class SimpleConfirmationDialogModule implements DialogContract<ConfirmationsPayload> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: ConfirmationsPayload): MatDialogRef<any> {
    const dialogRef = this.dialog.open(SimpleConfirmationDialogComponent, {
      data: payload,
      disableClose: payload.escapeToAbortNotAllowed
    });

    return dialogRef;
  }
}
