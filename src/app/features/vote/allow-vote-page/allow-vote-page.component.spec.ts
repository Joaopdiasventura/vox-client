import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowVotePageComponent } from './allow-vote-page.component';

describe('AllowVotePageComponent', () => {
  let component: AllowVotePageComponent;
  let fixture: ComponentFixture<AllowVotePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllowVotePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllowVotePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
