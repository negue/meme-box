import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicIframeComponent} from './dynamic-iframe.component';


@NgModule({
  declarations: [DynamicIframeComponent],
  exports: [
    DynamicIframeComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DynamicIframeModule { }
