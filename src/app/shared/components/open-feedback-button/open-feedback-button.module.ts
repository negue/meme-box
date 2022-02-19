import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OpenFeedbackButtonComponent} from './open-feedback-button.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [
    OpenFeedbackButtonComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    OpenFeedbackButtonComponent
  ]
})
export class OpenFeedbackButtonModule { }
