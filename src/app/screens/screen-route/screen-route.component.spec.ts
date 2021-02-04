import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ScreenRouteComponent} from './screen-route.component';

describe('ScreenRouteComponent', () => {
  let component: ScreenRouteComponent;
  let fixture: ComponentFixture<ScreenRouteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
