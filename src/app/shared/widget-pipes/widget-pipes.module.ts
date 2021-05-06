import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClipTemplatePipe} from "./clip-template.pipe";


@NgModule({
  declarations: [ClipTemplatePipe],
  exports: [
    ClipTemplatePipe
  ],
  imports: [
    CommonModule
  ]
})
export class WidgetPipesModule { }
