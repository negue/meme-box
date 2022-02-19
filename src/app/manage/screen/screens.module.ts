import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import {MatListModule} from "@angular/material/list";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ScreenOverviewComponent} from "./screen-overview/screen-overview.component";
import {ScreenInfoComponent} from "./screen-overview/screen-info/screen-info.component";
import {ClipTypeModule} from "@memebox/state-components";
import {CardOverviewModule} from "../../shared/components/card-overview/card-overview.module";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ScreensArrayToUrlPipe} from './screen-overview/screen-url-dialog/screens-array-to-url.pipe';
import {ScreenUrlDialogComponent} from "./screen-overview/screen-url-dialog/screen-url-dialog.component";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NetworkUrlViewModule} from "../../shared/components/network-url-view/network-url-view.module";
import {SelectedScreenAmountPipe} from "./screen-overview/screen-url-dialog/selected-screen-amount.pipe";
import {ClipsInScreenAmountPipe} from "./screen-overview/screen-url-dialog/clips-in-screen-amount.pipe";

const routes: Routes = [
  {
    path: '',
    component: ScreenOverviewComponent
  }
];


@NgModule({
  // todo finish renaming
  declarations: [
    ScreenOverviewComponent,
    ScreenInfoComponent,
    ScreenUrlDialogComponent,
    ScreensArrayToUrlPipe,
    SelectedScreenAmountPipe,
    ClipsInScreenAmountPipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    ClipTypeModule,
    CardOverviewModule,
    MatTooltipModule,
    MatCheckboxModule,
    NetworkUrlViewModule
  ]
})
export class ScreensModule {
}
