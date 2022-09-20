import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogContract} from "../dialog.contract";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {Screen} from "@memebox/contracts";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {ScreenEditComponent} from "./screen-edit.component";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {CustomFormControlModule} from "@gewd/mat-utils/custom-form-control";
import {MatButtonModule} from "@angular/material/button";
import {CodemirrorModule} from "@gewd/components/codemirror";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";

@NgModule({
  declarations: [
    ScreenEditComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CustomFormControlModule,
    MatButtonModule,
    CodemirrorModule,
    OpenFeedbackButtonModule,
  ],
  providers: [],
})
export class ScreenEditModule implements DialogContract<Screen, ScreenEditComponent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: Screen): MatDialogRef<ScreenEditComponent> {
    const dialogRef = this.dialog.open(ScreenEditComponent, {
      data: payload,
      width: '60%'
    });

    return dialogRef;
  }
}
