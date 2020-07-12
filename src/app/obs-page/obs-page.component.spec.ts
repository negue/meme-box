import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ObsPageComponent} from './obs-page.component';

describe('ObsPageComponent', () => {
  let component: ObsPageComponent;
  let fixture: ComponentFixture<ObsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
