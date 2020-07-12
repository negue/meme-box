import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ObsEditComponent} from './obs-edit.component';

describe('ObsEditComponent', () => {
  let component: ObsEditComponent;
  let fixture: ComponentFixture<ObsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
