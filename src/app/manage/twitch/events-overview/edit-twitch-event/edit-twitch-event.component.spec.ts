import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EditTwitchEventComponent} from './edit-twitch-event.component';

describe('EditTwitchEventComponent', () => {
  let component: EditTwitchEventComponent;
  let fixture: ComponentFixture<EditTwitchEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTwitchEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTwitchEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
