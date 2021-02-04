import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {EventsOverviewComponent} from './events-overview.component';

describe('EventsOverviewComponent', () => {
  let component: EventsOverviewComponent;
  let fixture: ComponentFixture<EventsOverviewComponent>;

  beforeEach(waitForAsync(() => {
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
