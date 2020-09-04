import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardOverviewComponent } from './card-overview.component';

describe('CardOverviewComponent', () => {
  let component: CardOverviewComponent;
  let fixture: ComponentFixture<CardOverviewComponent>;

  beforeEach(async(() => {
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
