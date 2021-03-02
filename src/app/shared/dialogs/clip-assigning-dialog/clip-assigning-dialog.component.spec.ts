import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClipAssigningDialogComponent } from './clip-assigning-dialog.component';

describe('ClipAssigningDialogComponent', () => {
  let component: ClipAssigningDialogComponent;
  let fixture: ComponentFixture<ClipAssigningDialogComponent>;

  beforeEach(waitForAsync(() => {
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
