import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsOverviewComponent} from './settings-overview/settings-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import { StyleguideModule } from '../../shared/styleguide/styleguide.module';

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
        MatIconModule,
        MatButtonModule,
        StyleguideModule,
    ],
})
export class SettingsModule {
}
