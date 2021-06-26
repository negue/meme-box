import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VersionCardComponent} from './version-card.component';
import {MatIconModule} from "@angular/material/icon";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatBadgeModule} from "@angular/material/badge";
import {MatButtonModule} from "@angular/material/button";
import {ConfigCardModule} from "../config-card/config-card.module";


@NgModule({
  declarations: [VersionCardComponent],
  exports: [
    VersionCardComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatButtonModule,
    ConfigCardModule
  ]
})
export class VersionCardModule { }
