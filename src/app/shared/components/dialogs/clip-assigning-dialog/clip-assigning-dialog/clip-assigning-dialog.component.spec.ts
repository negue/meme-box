import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ClipAssigningDialogComponent} from './clip-assigning-dialog.component';

describe('ClipAssigningDialogComponent', () => {
  let component: ClipAssigningDialogComponent;
  let fixture: ComponentFixture<ClipAssigningDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClipAssigningDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipAssigningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
