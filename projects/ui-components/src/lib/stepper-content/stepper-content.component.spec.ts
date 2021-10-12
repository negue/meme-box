import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StepperContentComponent} from './stepper-content.component';
import {STEPPER_CONTENT_MODULES} from "@memebox/ui-components";

describe('StepperContentComponent', () => {
  let component: StepperContentComponent;
  let fixture: ComponentFixture<StepperContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepperContentComponent ],
      imports: STEPPER_CONTENT_MODULES
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepperContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
