import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MediaCardComponent} from "./media-card.component";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {AutoScaleModule} from "@gewd/components/auto-scale";
import {CheckboxChipModule, UiComponentsPipesModule} from "@memebox/ui-components";
import {ActionPreviewModule, ActionTypeIconModule} from "@memebox/state-components";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatChipsModule} from "@angular/material/chips";
import {MatMenuModule} from "@angular/material/menu";
import {MatDividerModule} from "@angular/material/divider";
import {ActionShortcutToolbarModule} from "../action-shortcut-toolbar/action-shortcut-toolbar.module";
import {DirectivesModule} from "../../../../shared/directives/directives.module";


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
    UiComponentsPipesModule,
    ActionTypeIconModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    ActionShortcutToolbarModule,
    ActionPreviewModule,
    DirectivesModule,
    CheckboxChipModule
  ]
})
export class MediaCardModule {
}
