import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenArrangePreviewComponent} from './screen-arrange-preview.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {AutoScaleModule} from '@gewd/components/auto-scale';
import {ActionPreviewModule} from '@memebox/state-components';
import {DragResizeMediaModule} from '../drag-resize-media/drag-resize-media.module';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {UiComponentsPipesModule} from '@memebox/ui-components';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';
import {OpenFeedbackButtonModule} from "../../../components/open-feedback-button/open-feedback-button.module";


@NgModule({
  declarations: [ScreenArrangePreviewComponent],
  exports: [
    ScreenArrangePreviewComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    AutoScaleModule,
    ActionPreviewModule,
    DragResizeMediaModule,
    MatCheckboxModule,
    MatButtonModule,
    UiComponentsPipesModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    OpenFeedbackButtonModule
  ]
})
export class ScreenArrangePreviewModule {
}
