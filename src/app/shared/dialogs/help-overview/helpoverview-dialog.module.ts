import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
// TODO move and why from server constants? :D
import {MatButtonModule} from "@angular/material/button";
import {HelpOverviewComponent} from "./help-overview.component";
import {MatListModule} from "@angular/material/list";

@NgModule({
  declarations: [
    HelpOverviewComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
  ],
  providers: [],
})
export class HelpOverviewDialogModule implements DialogContract<void, HelpOverviewComponent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: void): MatDialogRef<any> {
    const dialogRef = this.dialog.open(HelpOverviewComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw',
      minHeight: '50vh'
    });

    return dialogRef;
  }
}
