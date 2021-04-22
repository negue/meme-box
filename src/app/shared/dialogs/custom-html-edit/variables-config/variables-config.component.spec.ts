import {ComponentFixture, TestBed} from '@angular/core/testing';

import {VariablesConfigComponent} from './variables-config.component';

describe('VariablesConfigComponent', () => {
  let component: VariablesConfigComponent;
  let fixture: ComponentFixture<VariablesConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariablesConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariablesConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
