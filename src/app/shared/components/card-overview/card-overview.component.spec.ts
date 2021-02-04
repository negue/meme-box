import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {CardOverviewComponent} from './card-overview.component';

describe('CardOverviewComponent', () => {
  let component: CardOverviewComponent;
  let fixture: ComponentFixture<CardOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CardOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
