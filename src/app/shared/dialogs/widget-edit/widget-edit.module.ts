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
import {VariablesConfigComponent} from './variables-config/variables-config.component';
import {WidgetVariableInputModule} from "../../components/dynamic-variable-input/widget-variable-input.module";
import {CodemirrorModule} from "@gewd/components/codemirror";

@NgModule({
  declarations: [
    WidgetEditComponent,
    VariablesConfigComponent
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
    WidgetVariableInputModule,
    CodemirrorModule
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
