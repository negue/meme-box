import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClipChipsListComponent} from './clip-chips-list.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [ClipChipsListComponent],
  exports: [
    ClipChipsListComponent
  ],
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule
  ]
})
export class ClipChipsListModule { }
