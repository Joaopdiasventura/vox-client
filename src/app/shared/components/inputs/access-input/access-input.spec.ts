import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessInput } from './access-input';

describe('AccessInput', () => {
  let component: AccessInput;
  let fixture: ComponentFixture<AccessInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
