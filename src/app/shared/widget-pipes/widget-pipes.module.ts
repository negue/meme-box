import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WidgetTemplatePipe} from "./clip-template.pipe";

@NgModule({
  declarations: [WidgetTemplatePipe],
  exports: [
    WidgetTemplatePipe
  ],
  imports: [
    CommonModule
  ]
})
export class WidgetPipesModule { }
