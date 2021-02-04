import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CompactClipCardComponent} from './compact-clip-card.component';

describe('CompactClipCardComponent', () => {
  let component: CompactClipCardComponent;
  let fixture: ComponentFixture<CompactClipCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CompactClipCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompactClipCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
