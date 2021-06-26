import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfigCardComponent} from './config-card.component';
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [
    ConfigCardComponent
  ],
  exports: [
    ConfigCardComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class ConfigCardModule { }
