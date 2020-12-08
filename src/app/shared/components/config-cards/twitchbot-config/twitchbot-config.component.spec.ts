import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitchbotConfigComponent } from './twitchbot-config.component';

describe('TwitchbotConfigComponent', () => {
  let component: TwitchbotConfigComponent;
  let fixture: ComponentFixture<TwitchbotConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitchbotConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitchbotConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
