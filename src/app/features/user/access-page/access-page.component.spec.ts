import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessPageComponent } from './access-page.component';

describe('AccessPageComponent', () => {
  let component: AccessPageComponent;
  let fixture: ComponentFixture<AccessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
