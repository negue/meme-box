import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenPreviewSidebarComponent } from './screen-preview-sidebar.component';


@NgModule({
  declarations: [ScreenPreviewSidebarComponent],
  exports: [
    ScreenPreviewSidebarComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ScreenPreviewSidebarModule {
}
