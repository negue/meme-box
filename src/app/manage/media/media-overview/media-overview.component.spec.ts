import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {MediaOverviewComponent} from './media-overview.component';

describe('MediaOverviewComponent', () => {
  let component: MediaOverviewComponent;
  let fixture: ComponentFixture<MediaOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MediaOverviewComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
