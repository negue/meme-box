import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DragResizeMediaComponent} from './drag-resize-media.component';

describe('DragResizeMediaComponent', () => {
  let component: DragResizeMediaComponent;
  let fixture: ComponentFixture<DragResizeMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragResizeMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragResizeMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
