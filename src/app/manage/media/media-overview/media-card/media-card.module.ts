import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MediaCardComponent } from "./media-card.component";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { AutoScaleModule } from "@gewd/components/auto-scale";
import { PipesModule } from "../../../../core/pipes/pipes.module";
import { ClipTypeModule } from "../../../../shared/components/clip-type/clip-type.module";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatChipsModule } from "@angular/material/chips";


@NgModule({
  declarations: [MediaCardComponent],
  exports: [
    MediaCardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    AutoScaleModule,
    PipesModule,
    ClipTypeModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatChipsModule
  ]
})
export class MediaCardModule {
}
