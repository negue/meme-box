import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MobileClipOverviewComponent} from './mobile-clip-overview/mobile-clip-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatRippleModule} from "@angular/material/core";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSelectModule} from "@angular/material/select";
import {ActionTypeIconModule} from "@memebox/state-components";
import {MatIconModule} from "@angular/material/icon";
import {DirectivesModule} from "../shared/directives/directives.module";
import {MatTooltipModule} from "@angular/material/tooltip";
import {DialogsModule} from "../shared/dialogs/dialogs.module";
import {MatDialogModule} from "@angular/material/dialog";
import {UiComponentsPipesModule} from "@memebox/ui-components";


const routes: Routes = [
  {
    path: '',
    component: MobileClipOverviewComponent,
  },
];

@NgModule({
  declarations: [MobileClipOverviewComponent],
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
    MatButtonModule,
    MatCardModule,
    MatRippleModule,
    MatToolbarModule,
    ActionTypeIconModule,
    MatIconModule,
    MatSelectModule,
    DirectivesModule,
    MatTooltipModule,
    DialogsModule,
    MatDialogModule,
    UiComponentsPipesModule
  ]
})
export class MobileModule {
}
