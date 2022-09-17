import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenPreviewSidebarComponent} from './screen-preview-sidebar.component';
import {MatCardModule} from '@angular/material/card';
import {ActionTypeIconModule} from '@memebox/state-components';
import {MatRippleModule} from '@angular/material/core';
import {MatListModule} from '@angular/material/list';
import {UiComponentsPipesModule} from '@memebox/ui-components';


@NgModule({
  declarations: [ScreenPreviewSidebarComponent],
  exports: [
    ScreenPreviewSidebarComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    ActionTypeIconModule,
    MatRippleModule,
    MatListModule,
    UiComponentsPipesModule
  ]
})
export class ScreenPreviewSidebarModule {
}
