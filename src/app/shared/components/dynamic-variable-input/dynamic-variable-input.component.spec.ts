import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DynamicVariableInputComponent} from './dynamic-variable-input.component';

describe('DynamicVariableInputComponent', () => {
  let component: DynamicVariableInputComponent;
  let fixture: ComponentFixture<DynamicVariableInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicVariableInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicVariableInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
