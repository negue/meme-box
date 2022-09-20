import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompactActionCardComponent} from './compact-action-card.component';
import {MatCardModule} from "@angular/material/card";
import {ClipChipsListModule} from "../clip-chips-list/clip-chips-list.module";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ActionPreviewModule} from "../action-preview/action-preview.module";
import {ActionTypeIconModule} from "../action-type-icon/action-type-icon.module";


@NgModule({
  declarations: [CompactActionCardComponent],
  exports: [
    CompactActionCardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    ActionTypeIconModule,
    ActionPreviewModule,
    ClipChipsListModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class CompactClipCardModule { }
