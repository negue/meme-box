import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenArrangeComponent} from './screen-arrange.component';
import {PositionToStringPipe} from './position-to-string.pipe';
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {VisibilityToStringPipe} from "./visibility-to-string.pipe";
import {DialogContract} from "../dialog.contract";
import {Screen} from "@memebox/contracts";
import {MatDialogRef} from "@angular/material/dialog/dialog-ref";
import {MatTabsModule} from "@angular/material/tabs";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MatRippleModule} from "@angular/material/core";
import {ClipTypeModule} from "../../components/clip-type/clip-type.module";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {AutoScaleModule} from "@gewd/components/auto-scale";
import {ClipPreviewModule} from "../../components/clip-preview/clip-preview.module";
import {DragResizeMediaModule} from "./drag-resize-media/drag-resize-media.module";
import {TargetScreenModule} from "../../../screens/target-screen/target-screen.module";
import {SettingsToSizingTypePipe} from "./settings-to-sizing-type.pipe";

@NgModule({
  declarations: [
    ScreenArrangeComponent,
    PositionToStringPipe,
    VisibilityToStringPipe,
    SettingsToSizingTypePipe
  ],
  exports: [
    ScreenArrangeComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCardModule,
    MatRippleModule,
    ClipTypeModule,
    MatCheckboxModule,
    AutoScaleModule,
    ClipPreviewModule,
    DragResizeMediaModule,
    TargetScreenModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ScreenArrangeModule implements DialogContract<Screen> {
  constructor(private dialog: MatDialog) {
  }

  public openDialog (payload: Screen): MatDialogRef<any> {
    const dialogRef = this.dialog.open(ScreenArrangeComponent, {
      data: payload,
      autoFocus: false,
      minWidth: '100vw',
      maxWidth: '100vw',
      minHeight: '100vh',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog'
    });

    return dialogRef;
  }
}
