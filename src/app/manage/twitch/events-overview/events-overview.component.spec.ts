import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EventsOverviewComponent} from './events-overview.component';

describe('EventsOverviewComponent', () => {
  let component: EventsOverviewComponent;
  let fixture: ComponentFixture<EventsOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventsOverviewComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
