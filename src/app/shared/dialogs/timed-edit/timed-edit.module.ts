import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {TimedEditComponent} from "./timed-edit.component";
import {TimedClip} from "@memebox/contracts";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {ClipPreviewModule} from "../../components/clip-preview/clip-preview.module";
import {PipesModule} from "../../../core/pipes/pipes.module";
import {MatSelectModule} from "@angular/material/select";

@NgModule({
  declarations: [
    TimedEditComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ClipPreviewModule,
    PipesModule,
    MatSelectModule,
  ],
  providers: [],
})
export class TimedEditModule implements DialogContract<TimedClip> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: TimedClip): MatDialogRef<any> {
    const dialogRef = this.dialog.open(TimedEditComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw',
      minHeight: '50vh'
    });

    return dialogRef;
  }
}
