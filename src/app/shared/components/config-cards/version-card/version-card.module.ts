import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VersionCardComponent} from './version-card.component';
import {MatIconModule} from "@angular/material/icon";
import {MatCheckboxModule} from "@angular/material/checkbox";


@NgModule({
  declarations: [VersionCardComponent],
  exports: [
    VersionCardComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatCheckboxModule
  ]
})
export class VersionCardModule { }
