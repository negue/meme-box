import { NgModule } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { DialogContract } from "../dialog.contract";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import { DynamicIframeEditComponent } from "./dynamic-iframe-edit.component";
import { DynamicIframeContent } from "@memebox/utils";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CustomFormControlModule } from "@gewd/mat-utils/custom-form-control";
import { HighlightEditorModule } from "@gewd/components/highlight-editor";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { DynamicIframeModule } from "../../components/dynamic-iframe/dynamic-iframe.module";

@NgModule({
  declarations: [
    DynamicIframeEditComponent
  ],
  imports: [
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    CustomFormControlModule,
    HighlightEditorModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    DynamicIframeModule


  ],
  providers: [],
})
export class DynamicIframeEditModule implements DialogContract<DynamicIframeContent> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: DynamicIframeContent): MatDialogRef<any> {
    const dialogRef = this.dialog.open(DynamicIframeEditComponent, {
      data: payload,
      width: 'calc(min(1000px, 96%))',
      maxWidth: '96vw',
      minHeight: '50vh'
    });

    return dialogRef;
  }
}
