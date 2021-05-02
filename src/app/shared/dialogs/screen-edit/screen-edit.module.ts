import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogContract } from "../dialog.contract";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { Screen } from "@memebox/contracts";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import { ScreenEditComponent } from "./screen-edit.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CustomFormControlModule } from "@gewd/mat-utils/custom-form-control";
import { HighlightEditorModule } from "@gewd/components/highlight-editor";
import { MatButtonModule } from "@angular/material/button";
import { CodemirrorModule } from "@gewd/components/codemirror";

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
    HighlightEditorModule,
    MatButtonModule,
    CodemirrorModule,
  ],
  providers: [],
})
export class ScreenEditModule implements DialogContract<Screen> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: Screen): MatDialogRef<any> {
    const dialogRef = this.dialog.open(ScreenEditComponent, {
      data: payload,
      width: '60%'
    });

    return dialogRef;
  }
}
