import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {DashboardOverviewComponent} from './dashboard-overview/dashboard-overview.component';
import {GuardTypePipe} from "./dashboard-overview/dashboard-overview.guards";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

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
    MatIconModule
  ]
})
export class DashboardModule { }
