import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {DashboardOverviewComponent} from './dashboard-overview/dashboard-overview.component';
import {GuardTypePipe} from "./dashboard-overview/dashboard-overview.guards";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {TranslocoModule} from "@ngneat/transloco";
import {OpenFeedbackButtonModule} from "../../shared/components/open-feedback-button/open-feedback-button.module";

const routes: Routes = [
  {
    component: DashboardOverviewComponent,
    path: ''
  }
]

@NgModule({
  declarations: [
    DashboardOverviewComponent,
    GuardTypePipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    TranslocoModule,
    OpenFeedbackButtonModule
  ]
})
export class DashboardModule { }
