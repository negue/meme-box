import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {OAuthTargetComponent} from "./o-auth-target.component";

const routes: Routes = [
  {
    path: '',
    component: OAuthTargetComponent,
  },
];

@NgModule({
  declarations: [OAuthTargetComponent],
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
  ]
})
export class OAuthTargetModule { }
