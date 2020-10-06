import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PersistenceActionsComponent} from './persistence-actions.component';

describe('PersistenceActionsComponent', () => {
  let component: PersistenceActionsComponent;
  let fixture: ComponentFixture<PersistenceActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersistenceActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersistenceActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
