import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindGroupPageComponent } from './find-group-page.component';

describe('FindGroupPageComponent', () => {
  let component: FindGroupPageComponent;
  let fixture: ComponentFixture<FindGroupPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindGroupPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindGroupPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
