import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenArrangeSidebarComponent} from './screen-arrange-sidebar.component';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {ClipTypeModule} from '../../../../../../projects/state-components/src/lib/clip-type/clip-type.module';
import {PipesModule} from '../../../../../../projects/ui-components/src/lib/pipes/pipes.module';
import {MatRippleModule} from '@angular/material/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatListModule} from '@angular/material/list';


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
    ReactiveFormsModule,
    MatListModule
  ]
})
export class ScreenArrangeSidebarModule {
}
