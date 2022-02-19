import {NgModule} from "@angular/core";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import type {DialogContract} from "../dialog.contract";
import {CustomScriptDialogPayload} from "../dialog.contract";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {ScriptEditComponent} from "./script-edit.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CustomFormControlModule} from "@gewd/mat-utils/custom-form-control";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {CodemirrorModule} from "@gewd/components/codemirror";
import {MatTabsModule} from "@angular/material/tabs";
import {HintPanelModule} from "@memebox/ui-components";
import {CompactClipCardModule} from "@memebox/state-components";
import {ActionVariablesConfigModule} from "@memebox/action-variables/ui";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";

@NgModule({
  declarations: [
    ScriptEditComponent,
  ],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    CustomFormControlModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    CodemirrorModule,
    MatTabsModule,
    HintPanelModule,
    CompactClipCardModule,
    ActionVariablesConfigModule,
    OpenFeedbackButtonModule
  ],
  providers: [],
  exports: [
  ]
})
export class ScriptEditModule implements DialogContract<CustomScriptDialogPayload> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: CustomScriptDialogPayload): MatDialogRef<any> {
    const dialogRef = this.dialog.open(ScriptEditComponent, {
      data: payload,
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
