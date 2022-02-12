import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DragResizeMediaComponent} from './drag-resize-media.component';
import {NgxMoveableModule} from "ngx-moveable";
import {AutoScaleModule} from "@gewd/components/auto-scale";
import {ActionPreviewModule} from "@memebox/state-components";


@NgModule({
  declarations: [DragResizeMediaComponent],
  exports: [
    DragResizeMediaComponent
  ],
  imports: [
    CommonModule,
    NgxMoveableModule,
    ActionPreviewModule,
    AutoScaleModule
  ]
})
export class DragResizeMediaModule { }
