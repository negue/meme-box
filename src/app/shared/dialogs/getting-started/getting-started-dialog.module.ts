import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {GettingStartedComponent} from "./getting-started.component";
// TODO move and why from server constants? :D
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {ConfigMediaPathModule} from "../../../manage/media/media-overview/config-media-path/config-media-path.module";

@NgModule({
  declarations: [
    GettingStartedComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ConfigMediaPathModule
  ],
  providers: [],
})
export class GettingStartedModule implements DialogContract<any> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: any): MatDialogRef<any> {
    const dialogRef = this.dialog.open(GettingStartedComponent, {
      data: payload,
      autoFocus: false,
      minWidth: '100vw',
      maxWidth: '100vw',
      minHeight: '100vh',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      disableClose: true
    });

    return dialogRef;
  }
}
