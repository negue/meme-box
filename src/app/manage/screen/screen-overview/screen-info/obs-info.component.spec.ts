import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ObsInfoComponent} from './obs-info.component';

describe('ObsInfoComponent', () => {
  let component: ObsInfoComponent;
  let fixture: ComponentFixture<ObsInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObsInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
