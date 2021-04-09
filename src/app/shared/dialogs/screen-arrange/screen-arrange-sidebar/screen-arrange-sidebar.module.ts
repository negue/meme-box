import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenArrangeSidebarComponent } from './screen-arrange-sidebar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ClipTypeModule } from '../../../components/clip-type/clip-type.module';
import { PipesModule } from '../../../../core/pipes/pipes.module';
import { MatRippleModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [ScreenArrangeSidebarComponent],
  exports: [
    ScreenArrangeSidebarComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    ClipTypeModule,
    PipesModule,
    MatRippleModule,
    ReactiveFormsModule
  ]
})
export class ScreenArrangeSidebarModule {
}
