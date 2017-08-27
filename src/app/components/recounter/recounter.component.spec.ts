import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecounterComponent } from './recounter.component';

describe('RecounterComponent', () => {
  let component: RecounterComponent;
  let fixture: ComponentFixture<RecounterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecounterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
