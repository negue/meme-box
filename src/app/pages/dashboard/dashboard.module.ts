import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {DashboardOverviewComponent} from './dashboard-overview/dashboard-overview.component';

const routes: Routes = [
  {
    component: DashboardOverviewComponent,
    path: ''
  }
]

@NgModule({
  declarations: [
    DashboardOverviewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class DashboardModule { }
