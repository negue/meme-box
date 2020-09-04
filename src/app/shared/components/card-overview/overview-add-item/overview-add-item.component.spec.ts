import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewAddItemComponent } from './overview-add-item.component';

describe('OverviewAddItemComponent', () => {
  let component: OverviewAddItemComponent;
  let fixture: ComponentFixture<OverviewAddItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewAddItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewAddItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
