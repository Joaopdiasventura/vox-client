import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AllowVotePage } from "./allow-vote-page";

describe("AllowVotePage", () => {
  let component: AllowVotePage;
  let fixture: ComponentFixture<AllowVotePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllowVotePage],
    }).compileComponents();

    fixture = TestBed.createComponent(AllowVotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
