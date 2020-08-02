import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsOverviewComponent } from './settings-overview/settings-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MediaModule} from "../media/media.module";
import {MatCardModule} from "@angular/material/card";

const routes: Routes = [
  {
    path: '',
    component: SettingsOverviewComponent
  }
];

@NgModule({
  declarations: [SettingsOverviewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
  ]
})
export class SettingsModule { }
