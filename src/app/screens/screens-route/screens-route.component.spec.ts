import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScreensRouteComponent} from './screens-route.component';

describe('ScreensRouteComponent', () => {
  let component: ScreensRouteComponent;
  let fixture: ComponentFixture<ScreensRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreensRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreensRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
