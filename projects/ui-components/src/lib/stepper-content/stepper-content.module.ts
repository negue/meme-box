import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StepperContentComponent} from './stepper-content.component';
import {TranslocoModule} from "@ngneat/transloco";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {CdkStepperModule} from '@angular/cdk/stepper';
import {MatListModule} from "@angular/material/list";
import {StepComponent} from './step/step.component';
import {MatInputModule} from "@angular/material/input";
import {StepSubTextDirective} from './step-sub-text.directive';

export const STEPPER_CONTENT_MODULES = [
  CommonModule,
  TranslocoModule,
  CdkStepperModule,
  MatButtonModule,
  MatIconModule
];

@NgModule({
  declarations: [
    StepperContentComponent,
    StepComponent,
    StepSubTextDirective
  ],
  exports: [
    StepperContentComponent,
    StepComponent
  ],
  imports: [
    STEPPER_CONTENT_MODULES,
    MatListModule,
    MatInputModule
  ]
})
export class StepperContentModule { }
