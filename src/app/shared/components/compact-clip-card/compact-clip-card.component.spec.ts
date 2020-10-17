import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CompactClipCardComponent} from './compact-clip-card.component';

describe('CompactClipCardComponent', () => {
  let component: CompactClipCardComponent;
  let fixture: ComponentFixture<CompactClipCardComponent>;

  beforeEach(async(() => {
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
