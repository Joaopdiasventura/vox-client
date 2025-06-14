import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AddParticipantPage } from "./add-participant-page";

describe("AddParticipantPage", () => {
  let component: AddParticipantPage;
  let fixture: ComponentFixture<AddParticipantPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddParticipantPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AddParticipantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
