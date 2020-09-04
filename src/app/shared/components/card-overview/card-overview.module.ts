import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardOverviewComponent } from './card-overview.component';
import { OverviewItemComponent } from './overview-item/overview-item.component';
import { OverviewAddItemComponent } from './overview-add-item/overview-add-item.component';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";


@NgModule({
  declarations: [CardOverviewComponent, OverviewItemComponent, OverviewAddItemComponent],
  exports: [
    CardOverviewComponent,
    OverviewItemComponent,
    OverviewAddItemComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ]
})
export class CardOverviewModule { }
