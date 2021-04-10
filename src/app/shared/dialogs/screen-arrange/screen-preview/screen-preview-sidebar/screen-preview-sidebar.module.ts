import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenPreviewSidebarComponent } from './screen-preview-sidebar.component';
import { MatCardModule } from '@angular/material/card';
import { ClipTypeModule } from '../../../../components/clip-type/clip-type.module';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';


@NgModule({
  declarations: [ScreenPreviewSidebarComponent],
  exports: [
    ScreenPreviewSidebarComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    ClipTypeModule,
    MatRippleModule,
    MatListModule
  ]
})
export class ScreenPreviewSidebarModule {
}
