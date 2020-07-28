import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {UrlPanelComponent} from './url-panel.component';

describe('UrlPanelComponent', () => {
  let component: UrlPanelComponent;
  let fixture: ComponentFixture<UrlPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrlPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
