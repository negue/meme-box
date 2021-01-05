import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NetworkUrlViewComponent} from './network-url-view.component';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {QRCodeModule} from "angular2-qrcode";


@NgModule({
  declarations: [NetworkUrlViewComponent],
  exports: [
    NetworkUrlViewComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    QRCodeModule
  ]
})
export class NetworkUrlViewModule { }
