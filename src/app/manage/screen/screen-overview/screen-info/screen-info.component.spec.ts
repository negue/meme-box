import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScreenInfoComponent} from './screen-info.component';

describe('ObsInfoComponent', () => {
  let component: ScreenInfoComponent;
  let fixture: ComponentFixture<ScreenInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScreenInfoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
