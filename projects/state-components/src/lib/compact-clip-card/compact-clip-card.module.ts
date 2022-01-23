import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompactActionCardComponent} from './compact-action-card.component';
import {MatCardModule} from "@angular/material/card";
import {ClipTypeModule} from "../clip-type/clip-type.module";
import {ClipPreviewModule} from "../clip-preview/clip-preview.module";
import {ClipChipsListModule} from "../clip-chips-list/clip-chips-list.module";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";


@NgModule({
  declarations: [CompactActionCardComponent],
  exports: [
    CompactActionCardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    ClipTypeModule,
    ClipPreviewModule,
    ClipChipsListModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class CompactClipCardModule { }
