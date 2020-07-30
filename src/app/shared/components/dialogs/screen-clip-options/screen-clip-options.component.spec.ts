import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScreenClipOptionsComponent} from './screen-clip-options.component';

describe('ScreenClipOptionsComponent', () => {
  let component: ScreenClipOptionsComponent;
  let fixture: ComponentFixture<ScreenClipOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenClipOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenClipOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
