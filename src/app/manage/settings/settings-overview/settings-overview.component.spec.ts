import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {SettingsOverviewComponent} from './settings-overview.component';

describe('SettingsOverviewComponent', () => {
  let component: SettingsOverviewComponent;
  let fixture: ComponentFixture<SettingsOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsOverviewComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
