import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenPreviewSidebarComponent } from './screen-preview-sidebar.component';
import { MatCardModule } from '@angular/material/card';
import { ClipTypeModule } from '../../../../components/clip-type/clip-type.module';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { PipesModule } from '../../../../../core/pipes/pipes.module';


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
    MatListModule,
    PipesModule
  ]
})
export class ScreenPreviewSidebarModule {
}
