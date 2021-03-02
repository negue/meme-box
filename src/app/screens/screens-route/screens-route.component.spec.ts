import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ScreensRouteComponent} from './screens-route.component';

describe('ScreensRouteComponent', () => {
  let component: ScreensRouteComponent;
  let fixture: ComponentFixture<ScreensRouteComponent>;

  beforeEach(waitForAsync(() => {
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
