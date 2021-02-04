import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ClipTypeComponent} from './clip-type.component';

describe('ClipTypeComponent', () => {
  let component: ClipTypeComponent;
  let fixture: ComponentFixture<ClipTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ClipTypeComponent]
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
