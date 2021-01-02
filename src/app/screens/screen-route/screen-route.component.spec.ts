import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScreenRouteComponent} from './screen-route.component';

describe('ScreenRouteComponent', () => {
  let component: ScreenRouteComponent;
  let fixture: ComponentFixture<ScreenRouteComponent>;

  beforeEach(async(() => {
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
