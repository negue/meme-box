import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DragResizeMediaComponent} from './drag-resize-media.component';
import {NgxMoveableModule} from "ngx-moveable";
import {ClipPreviewModule} from "../../clip-preview/clip-preview.module";
import {AutoScaleModule} from "@gewd/components/auto-scale";


@NgModule({
  declarations: [DragResizeMediaComponent],
  exports: [
    DragResizeMediaComponent
  ],
  imports: [
    CommonModule,
    NgxMoveableModule,
    ClipPreviewModule,
    AutoScaleModule
  ]
})
export class DragResizeMediaModule { }
