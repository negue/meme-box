import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StepperContentComponent} from './stepper-content.component';
import {TranslocoModule} from "@ngneat/transloco";
import {MatStepperModule} from "@angular/material/stepper";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

export const STEPPER_CONTENT_MODULES = [
  CommonModule,
  TranslocoModule,
  MatStepperModule,
  MatButtonModule,
  MatIconModule
];

@NgModule({
  declarations: [
    StepperContentComponent
  ],
  imports: STEPPER_CONTENT_MODULES
})
export class StepperContentModule { }
