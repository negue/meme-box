import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ClipPreviewComponent} from './clip-preview.component';

describe('ClipPreviewComponent', () => {
  let component: ClipPreviewComponent;
  let fixture: ComponentFixture<ClipPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
