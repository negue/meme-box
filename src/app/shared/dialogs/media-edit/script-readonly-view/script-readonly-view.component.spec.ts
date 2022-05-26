import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ScriptReadonlyViewComponent} from './script-readonly-view.component';

describe('ScriptReadonlyViewComponent', () => {
  let component: ScriptReadonlyViewComponent;
  let fixture: ComponentFixture<ScriptReadonlyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptReadonlyViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptReadonlyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
