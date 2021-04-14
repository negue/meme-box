import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MobileClipOverviewComponent} from './mobile-clip-overview/mobile-clip-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatRippleModule} from "@angular/material/core";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSelectModule} from "@angular/material/select";
import {ClipTypeModule} from "../shared/components/clip-type/clip-type.module";
import {MatIconModule} from "@angular/material/icon";
import {StateModule} from "../state/state.module";


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
    ClipTypeModule,
    MatIconModule,
    MatSelectModule,
    StateModule,
  ]
})
export class MobileModule {
}
