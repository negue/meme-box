import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {VersionCardComponent} from './version-card.component';
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [VersionCardComponent],
  exports: [
    VersionCardComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class VersionCardModule { }
