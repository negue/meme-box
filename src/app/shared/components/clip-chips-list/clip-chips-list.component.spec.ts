import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ClipChipsListComponent} from './clip-chips-list.component';

describe('ClipChipsListComponent', () => {
  let component: ClipChipsListComponent;
  let fixture: ComponentFixture<ClipChipsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClipChipsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClipChipsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
