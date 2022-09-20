import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionPreviewComponent} from './action-preview.component';
import {UiComponentsPipesModule} from "@memebox/ui-components";
import {ActionTypeIconModule} from "../action-type-icon/action-type-icon.module";


@NgModule({
  declarations: [ActionPreviewComponent],
  exports: [
    ActionPreviewComponent
  ],
  imports: [
    CommonModule,
    UiComponentsPipesModule,
    ActionTypeIconModule
  ]
})
export class ActionPreviewModule { }
