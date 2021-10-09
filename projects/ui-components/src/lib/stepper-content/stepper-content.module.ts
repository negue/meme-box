import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StepperContentComponent} from './stepper-content.component';
import {TranslocoModule} from "@ngneat/transloco";
import {MatStepperModule} from "@angular/material/stepper";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

// To use the ModuleConfig also in Storybook
export const StepperContentModuleConfig: NgModule = {
  declarations: [
    StepperContentComponent
  ],
  imports: [
    CommonModule,
    TranslocoModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule
  ]
}

@NgModule(StepperContentModuleConfig)
export class StepperContentModule { }
