import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicIframeComponent} from './dynamic-iframe.component';
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [DynamicIframeComponent],
  exports: [
    DynamicIframeComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class DynamicIframeModule { }
