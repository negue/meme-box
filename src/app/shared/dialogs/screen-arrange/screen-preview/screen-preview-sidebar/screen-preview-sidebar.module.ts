import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenPreviewSidebarComponent } from './screen-preview-sidebar.component';
import { MatCardModule } from '@angular/material/card';
import { ClipTypeModule } from '../../../../components/clip-type/clip-type.module';


@NgModule({
  declarations: [ScreenPreviewSidebarComponent],
  exports: [
    ScreenPreviewSidebarComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    ClipTypeModule
  ]
})
export class ScreenPreviewSidebarModule {
}
