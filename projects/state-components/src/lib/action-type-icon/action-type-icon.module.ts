import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionTypeIconComponent} from './action-type-icon.component';
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [ActionTypeIconComponent],
  exports: [
    ActionTypeIconComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ]
})
export class ActionTypeIconModule {
}
