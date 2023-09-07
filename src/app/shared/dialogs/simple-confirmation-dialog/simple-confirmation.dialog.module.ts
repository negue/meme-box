import {NgModule} from "@angular/core";
import {ConfirmationsPayload, SimpleConfirmationDialogComponent} from "./simple-confirmation-dialog.component";
import {MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";

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
export class SimpleConfirmationDialogModule implements DialogContract<ConfirmationsPayload, SimpleConfirmationDialogComponent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: ConfirmationsPayload): MatDialogRef<SimpleConfirmationDialogComponent> {
    const dialogRef = this.dialog.open(SimpleConfirmationDialogComponent, {
      data: payload,
      disableClose: payload.escapeToAbortNotAllowed
    });

    return dialogRef;
  }
}
