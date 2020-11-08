import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ImportMediaFilesDialogComponent} from './import-media-files-dialog.component';

describe('ImportMediaFilesDialogComponent', () => {
  let component: ImportMediaFilesDialogComponent;
  let fixture: ComponentFixture<ImportMediaFilesDialogComponent>;

  beforeEach(async(() => {
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
