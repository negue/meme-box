import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenPreviewContentComponent } from './screen-preview-content.component';


@NgModule({
  declarations: [ScreenPreviewContentComponent],
  exports: [
    ScreenPreviewContentComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ScreenPreviewContentModule {
}
