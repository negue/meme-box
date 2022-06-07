import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OpenFeedbackButtonComponent} from './open-feedback-button.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";


@NgModule({
  declarations: [
    OpenFeedbackButtonComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  exports: [
    OpenFeedbackButtonComponent
  ]
})
export class OpenFeedbackButtonModule { }
