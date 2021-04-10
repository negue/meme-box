import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenPreviewComponent } from './screen-preview.component';
import { ScreenPreviewSidebarModule } from './screen-preview-sidebar/screen-preview-sidebar.module';
import { ScreenPreviewContentModule } from './screen-preview-content/screen-preview-content.module';


@NgModule({
  declarations: [ScreenPreviewComponent],
  imports: [
    CommonModule,
    ScreenPreviewSidebarModule,
    ScreenPreviewContentModule
  ]
})
export class ScreenPreviewModule {
}
