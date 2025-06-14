import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FollowVotePage } from "./follow-vote-page";

describe("FollowVotePage", () => {
  let component: FollowVotePage;
  let fixture: ComponentFixture<FollowVotePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowVotePage],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowVotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
