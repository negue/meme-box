import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationComponent} from './navigation.component';
import {MatTabsModule} from "@angular/material/tabs";
import {RouterModule} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {QrcodeDialogModule} from "../qrcode-dialog/qrcode-dialog.module";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatBadgeModule} from "@angular/material/badge";
import {TranslocoModule} from "@ngneat/transloco";


@NgModule({
  declarations: [NavigationComponent],
  exports: [
    NavigationComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    QrcodeDialogModule,
    MatTooltipModule,
    MatBadgeModule,
    TranslocoModule
  ]
})
export class NavigationModule {
}
