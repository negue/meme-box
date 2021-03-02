import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TwitchEditComponent } from './twitch-edit.component';

describe('TwitchEditComponent', () => {
  let component: TwitchEditComponent;
  let fixture: ComponentFixture<TwitchEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitchEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitchEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
