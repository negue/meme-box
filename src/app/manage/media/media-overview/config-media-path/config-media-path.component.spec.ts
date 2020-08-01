import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ConfigMediaPathComponent} from './config-media-path.component';

describe('ConfigMediaPathComponent', () => {
  let component: ConfigMediaPathComponent;
  let fixture: ComponentFixture<ConfigMediaPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigMediaPathComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigMediaPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
