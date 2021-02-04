import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {QrcodeDialogComponent} from './qrcode-dialog.component';

describe('QrcodeDialogComponent', () => {
  let component: QrcodeDialogComponent;
  let fixture: ComponentFixture<QrcodeDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QrcodeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrcodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
