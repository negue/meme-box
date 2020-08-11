import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QrcodeDialogComponent} from "./qrcode-dialog.component";
import {MobileViewLinkComponent} from "./mobile-view-link/mobile-view-link.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {QRCodeModule} from "angular2-qrcode";


@NgModule({
  declarations: [QrcodeDialogComponent, MobileViewLinkComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    QRCodeModule
  ]
})
export class QrcodeDialogModule { }
