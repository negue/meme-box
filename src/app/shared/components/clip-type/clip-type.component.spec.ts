import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ClipTypeComponent} from './clip-type.component';

describe('ClipTypeComponent', () => {
  let component: ClipTypeComponent;
  let fixture: ComponentFixture<ClipTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
