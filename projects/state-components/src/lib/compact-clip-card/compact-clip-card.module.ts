import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompactClipCardComponent} from './compact-clip-card.component';
import {MatCardModule} from "@angular/material/card";
import {ClipTypeModule} from "../clip-type/clip-type.module";
import {ClipPreviewModule} from "../clip-preview/clip-preview.module";
import {ClipChipsListModule} from "../clip-chips-list/clip-chips-list.module";


@NgModule({
  declarations: [CompactClipCardComponent],
  exports: [
    CompactClipCardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    ClipTypeModule,
    ClipPreviewModule,
    ClipChipsListModule
  ]
})
export class CompactClipCardModule { }
