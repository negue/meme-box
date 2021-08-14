import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClipPreviewComponent} from './clip-preview.component';
import {PipesModule} from "@memebox/ui-components";
import {ClipTypeModule} from "../clip-type/clip-type.module";


@NgModule({
  declarations: [ClipPreviewComponent],
  exports: [
    ClipPreviewComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    ClipTypeModule
  ]
})
export class ClipPreviewModule { }
