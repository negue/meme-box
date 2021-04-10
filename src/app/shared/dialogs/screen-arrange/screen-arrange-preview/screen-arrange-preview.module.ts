import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenArrangePreviewComponent } from './screen-arrange-preview.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AutoScaleModule } from '@gewd/components/auto-scale';
import { ClipPreviewModule } from '../../../components/clip-preview/clip-preview.module';
import { DragResizeMediaModule } from '../drag-resize-media/drag-resize-media.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { PipesModule } from '../../../../core/pipes/pipes.module';


@NgModule({
  declarations: [ScreenArrangePreviewComponent],
  exports: [
    ScreenArrangePreviewComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    AutoScaleModule,
    ClipPreviewModule,
    DragResizeMediaModule,
    MatCheckboxModule,
    MatButtonModule,
    PipesModule
  ]
})
export class ScreenArrangePreviewModule {
}
