import {Component, ContentChild, Input} from '@angular/core';
import {CdkStep} from "@angular/cdk/stepper";
import {StepSubTextDirective} from "../step-sub-text.directive";

@Component({
  selector: 'lib-step',
  template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `,
  providers: [{provide: CdkStep, useExisting: StepComponent}]
})
export class StepComponent extends CdkStep {

  @Input()
  public subText: string;

  @Input()
  public enabled = true;

  @ContentChild(StepSubTextDirective) subTextTemplate: StepSubTextDirective;
}
