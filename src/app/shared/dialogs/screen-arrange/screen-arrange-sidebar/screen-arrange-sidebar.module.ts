import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenArrangeSidebarComponent} from './screen-arrange-sidebar.component';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {ActionTypeIconModule} from '@memebox/state-components';
import {UiComponentsPipesModule} from '@memebox/ui-components';
import {MatRippleModule} from '@angular/material/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatListModule} from '@angular/material/list';
import {ScreenActionAssignmentModule} from "../../../screenActionAssignment.service";


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
    ActionTypeIconModule,
    UiComponentsPipesModule,
    MatRippleModule,
    ReactiveFormsModule,
    MatListModule,
    ScreenActionAssignmentModule
  ]
})
export class ScreenArrangeSidebarModule {
}
