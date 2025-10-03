import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationControl } from './pagination-control';

describe('PaginationControl', () => {
  let component: PaginationControl;
  let fixture: ComponentFixture<PaginationControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationControl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
