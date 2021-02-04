import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {NetworkUrlViewComponent} from './network-url-view.component';

describe('NetworkUrlViewComponent', () => {
  let component: NetworkUrlViewComponent;
  let fixture: ComponentFixture<NetworkUrlViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkUrlViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkUrlViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
