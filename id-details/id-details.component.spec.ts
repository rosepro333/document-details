import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdDetailsComponent } from './id-details.component';

describe('IdDetailsComponent', () => {
  let component: IdDetailsComponent;
  let fixture: ComponentFixture<IdDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
