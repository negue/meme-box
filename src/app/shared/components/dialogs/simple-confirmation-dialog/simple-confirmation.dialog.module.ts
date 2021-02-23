import {NgModule} from "@angular/core";
import {ConfirmationsPayload, SimpleConfirmationDialogComponent} from "./simple-confirmation-dialog.component";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";

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
export class SimpleConfirmationDialogModule {
  static getComponent(): typeof SimpleConfirmationDialogComponent {
    return SimpleConfirmationDialogComponent;
  }

  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: ConfirmationsPayload): Promise<boolean> {
    const dialogRef = this.dialog.open(SimpleConfirmationDialogComponent, {
      data: payload,
    });

    return dialogRef.afterClosed().toPromise();
  }
}
