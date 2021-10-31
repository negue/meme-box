import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[libStepSubText]'
})
export class StepSubTextDirective {
  constructor(public template: TemplateRef<any>) { }
}
