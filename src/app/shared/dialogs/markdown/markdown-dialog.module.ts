import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MarkdownComponent} from "./markdown.component";
// TODO move and why from server constants? :D
import {MarkdownDialogPayload} from "../../../../../server/constants";
import {MarkdownModule} from "@gewd/markdown/module";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
  declarations: [
    MarkdownComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MarkdownModule,
    MatButtonModule,
  ],
  providers: [],
})
export class MarkdownDialogModule implements DialogContract<MarkdownDialogPayload, MarkdownComponent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: MarkdownDialogPayload): MatDialogRef<MarkdownComponent> {
    const dialogRef = this.dialog.open(MarkdownComponent, {
      data: payload,
      autoFocus: false,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw',
      minHeight: '50vh'
    });

    return dialogRef;
  }
}
