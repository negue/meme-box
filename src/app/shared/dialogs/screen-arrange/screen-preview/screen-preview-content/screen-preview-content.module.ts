import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenPreviewContentComponent } from './screen-preview-content.component';
import { AutoScaleModule } from '@gewd/components/auto-scale';
import { TargetScreenModule } from '../../../../../screens/target-screen/target-screen.module';


@NgModule({
  declarations: [ScreenPreviewContentComponent],
  exports: [
    ScreenPreviewContentComponent
  ],
  imports: [
    CommonModule,
    AutoScaleModule,
    TargetScreenModule
  ]
})
export class ScreenPreviewContentModule {
}
