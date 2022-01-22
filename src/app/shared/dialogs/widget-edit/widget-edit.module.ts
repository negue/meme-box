import {NgModule} from "@angular/core";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import type {CustomHtmlDialogPayload, DialogContract} from "../dialog.contract";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {WidgetEditComponent} from "./widget-edit.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CustomFormControlModule} from "@gewd/mat-utils/custom-form-control";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {DynamicIframeModule} from "../../components/dynamic-iframe/dynamic-iframe.module";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {CodemirrorModule} from "@gewd/components/codemirror";
import {ActionVariablesConfigModule} from "@memebox/action-variables/ui";
import {OpenFeedbackButtonModule} from "../../components/open-feedback-button/open-feedback-button.module";

@NgModule({
  declarations: [
    WidgetEditComponent,
  ],
  imports: [
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    CustomFormControlModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    DynamicIframeModule,
    MatCheckboxModule,
    CodemirrorModule,
    ActionVariablesConfigModule,
    OpenFeedbackButtonModule
  ],
  providers: [],
})
export class WidgetEditModule implements DialogContract<CustomHtmlDialogPayload> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: CustomHtmlDialogPayload): MatDialogRef<any> {
    const dialogRef = this.dialog.open(WidgetEditComponent, {
      data: payload,
      minWidth: '100vw',
      maxWidth: '100vw',
      minHeight: '100vh',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog'
    });

    return dialogRef;
  }
}
