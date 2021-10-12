import {Component, QueryList} from '@angular/core';
import {CdkStepper} from "@angular/cdk/stepper";
import {StepComponent} from "./step/step.component";

@Component({
  selector: 'lib-stepper-content',
  templateUrl: './stepper-content.component.html',
  styleUrls: ['./stepper-content.component.scss'],
  providers: [{provide: CdkStepper, useExisting: StepperContentComponent}]
})
export class StepperContentComponent extends CdkStepper {
  readonly typedSteps: QueryList<StepComponent> = this.steps as QueryList<StepComponent>;

  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }
}
