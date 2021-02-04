import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ImportMediaFilesDialogComponent} from './import-media-files-dialog.component';

describe('ImportMediaFilesDialogComponent', () => {
  let component: ImportMediaFilesDialogComponent;
  let fixture: ComponentFixture<ImportMediaFilesDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportMediaFilesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportMediaFilesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
