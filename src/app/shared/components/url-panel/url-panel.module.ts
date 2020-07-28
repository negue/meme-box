import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UrlPanelComponent} from './url-panel.component';
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [UrlPanelComponent],
  exports: [
    UrlPanelComponent
  ],
  imports: [
    CommonModule,

    ClipboardModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class UrlPanelModule { }
