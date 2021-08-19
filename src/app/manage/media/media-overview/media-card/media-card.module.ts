import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MediaCardComponent} from "./media-card.component";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {AutoScaleModule} from "@gewd/components/auto-scale";
import {PipesModule} from "../../../../../../projects/ui-components/src/lib/pipes/pipes.module";
import {ClipTypeModule} from "../../../../../../projects/state-components/src/lib/clip-type/clip-type.module";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatChipsModule} from "@angular/material/chips";
import {MatMenuModule} from "@angular/material/menu";
import {MatDividerModule} from "@angular/material/divider";
import {ActionShortcutToolbarModule} from "../action-shortcut-toolbar/action-shortcut-toolbar.module";


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
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    ActionShortcutToolbarModule
  ]
})
export class MediaCardModule {
}
