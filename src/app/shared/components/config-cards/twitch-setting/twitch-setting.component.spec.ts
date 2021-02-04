import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {TwitchSettingComponent} from './twitch-setting.component';

describe('TwitchSettingComponent', () => {
  let component: TwitchSettingComponent;
  let fixture: ComponentFixture<TwitchSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitchSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitchSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
