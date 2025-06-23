import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CustomButton } from "./custom-button";

describe("CustomButton", () => {
  let component: CustomButton;
  let fixture: ComponentFixture<CustomButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomButton],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
