import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitchIconComponent } from './twitch-icon.component';

describe('TwitchComponent', () => {
  let component: TwitchIconComponent;
  let fixture: ComponentFixture<TwitchIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitchIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitchIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
