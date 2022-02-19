import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionPreviewComponent} from './action-preview.component';
import {PipesModule} from "@memebox/ui-components";
import {ClipTypeModule} from "../clip-type/clip-type.module";


@NgModule({
  declarations: [ActionPreviewComponent],
  exports: [
    ActionPreviewComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    ClipTypeModule
  ]
})
export class ActionPreviewModule { }
