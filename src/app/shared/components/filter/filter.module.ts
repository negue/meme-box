import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FilterComponent} from './filter.component';
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatListModule} from "@angular/material/list";
import {TranslocoModule} from "@ngneat/transloco";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatBadgeModule} from "@angular/material/badge";
import {MatButtonModule} from "@angular/material/button";
import {IsSelectedPipe} from './is-selected.pipe';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {GroupByTypePipe} from './group-by-type.pipe';


@NgModule({
  declarations: [FilterComponent, IsSelectedPipe, GroupByTypePipe],
  exports: [
    FilterComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    TranslocoModule,
    MatExpansionModule,
    MatBadgeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class FilterModule { }
