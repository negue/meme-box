import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicIframeComponent} from './dynamic-iframe.component';
import {MatIconModule} from "@angular/material/icon";
import {WidgetStoreRemoteAdapter} from "./widget-store-remote-adapter.service";


@NgModule({
  declarations: [DynamicIframeComponent],
  exports: [
    DynamicIframeComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ],
  providers: [
    WidgetStoreRemoteAdapter
  ]
})
export class DynamicIframeModule { }
