import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenClipConfigComponent} from './screen-clip-config.component';
import {DragResizeMediaModule} from "./drag-resize-media/drag-resize-media.module";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {ClipTypeModule} from "../clip-type/clip-type.module";
import {PositionToStringPipe} from './position-to-string.pipe';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {CustomFormControlModule} from "@gewd/mat-utils/custom-form-control";
import {HighlightEditorModule} from "@gewd/components/highlight-editor";
import {FormsModule} from "@angular/forms";
import {MatExpansionModule} from "@angular/material/expansion";
import {AutoScaleModule} from "@gewd/components/auto-scale";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule} from "@angular/material/dialog";

@NgModule({
  declarations: [ScreenClipConfigComponent, PositionToStringPipe],
  exports: [
    ScreenClipConfigComponent
  ],
  imports: [
    CommonModule,
    DragResizeMediaModule,
    MatListModule,
    MatIconModule,
    ClipTypeModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    CustomFormControlModule,
    HighlightEditorModule,
    FormsModule,
    MatExpansionModule,
    AutoScaleModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ScreenClipConfigModule { }
