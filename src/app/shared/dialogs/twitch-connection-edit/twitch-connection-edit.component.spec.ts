import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TwitchConnectionEditComponent} from './twitch-connection-edit.component';

describe('TwitchConnectionEditComponent', () => {
  let component: TwitchConnectionEditComponent;
  let fixture: ComponentFixture<TwitchConnectionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwitchConnectionEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitchConnectionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
