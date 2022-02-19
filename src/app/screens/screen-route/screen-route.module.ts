import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ScreenRouteComponent} from "./screen-route.component";
import {CommonModule} from "@angular/common";
import {TargetScreenModule} from "../target-screen/target-screen.module";


const routes: Routes = [
  {
    path: '',
    component: ScreenRouteComponent
  }
];


@NgModule({
  declarations: [
    ScreenRouteComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TargetScreenModule,
  ],
  exports: [RouterModule]
})
export class ScreenRouteModule {
}
