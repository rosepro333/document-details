import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDocumentComponent } from './print-document.component';

describe('PrintDocumentComponent', () => {
  let component: PrintDocumentComponent;
  let fixture: ComponentFixture<PrintDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
