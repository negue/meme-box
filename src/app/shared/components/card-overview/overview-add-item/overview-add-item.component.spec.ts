import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {OverviewAddItemComponent} from './overview-add-item.component';

describe('OverviewAddItemComponent', () => {
  let component: OverviewAddItemComponent;
  let fixture: ComponentFixture<OverviewAddItemComponent>;

  beforeEach(waitForAsync(() => {
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
