import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {TwitchEventInfoComponent} from './twitch-event-info.component';

describe('EventInfoComponent', () => {
  let component: TwitchEventInfoComponent;
  let fixture: ComponentFixture<TwitchEventInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TwitchEventInfoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitchEventInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
