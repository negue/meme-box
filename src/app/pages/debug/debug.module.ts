import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivityStateComponent} from './activity-state/activity-state.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
     component: ActivityStateComponent,
    path: 'activity-state'
  },
  {
    path: '**',
    redirectTo: 'activity-state'
  }
]

@NgModule({
  declarations: [
    ActivityStateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class DebugModule { }
