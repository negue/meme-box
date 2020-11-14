import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TimedEventInfoComponent} from './timed-event-info.component';

describe('EventInfoComponent', () => {
  let component: TimedEventInfoComponent;
  let fixture: ComponentFixture<TimedEventInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimedEventInfoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimedEventInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
