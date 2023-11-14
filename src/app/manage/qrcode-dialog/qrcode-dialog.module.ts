import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrcodeDialogComponent } from "./qrcode-dialog.component";
import { MobileViewLinkComponent } from "./mobile-view-link/mobile-view-link.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { NetworkUrlViewModule } from "../../shared/components/network-url-view/network-url-view.module";
import { OpenFeedbackButtonModule } from "../../shared/components/open-feedback-button/open-feedback-button.module";


@NgModule({
  declarations: [QrcodeDialogComponent, MobileViewLinkComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    // use https://github.com/cordobo/angularx-qrcode
    NetworkUrlViewModule,
    OpenFeedbackButtonModule
  ]
})
export class QrcodeDialogModule {
}
