import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MobileClipOverviewComponent} from './mobile-clip-overview/mobile-clip-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatRippleModule} from "@angular/material/core";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSliderModule} from "@angular/material/slider";
import {MatSelectModule} from "@angular/material/select";
import {ClipTypeModule} from "../shared/components/clip-type/clip-type.module";


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
    MatSliderModule,
    MatSelectModule,
    ClipTypeModule,
  ]
})
export class MobileModule { }
