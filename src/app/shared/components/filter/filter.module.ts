import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FilterComponent} from './filter.component';
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatListModule} from "@angular/material/list";


@NgModule({
  declarations: [FilterComponent],
  exports: [
    FilterComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule
  ]
})
export class FilterModule { }
