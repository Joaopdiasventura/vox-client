import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FindGroupPage } from "./find-group-page";

describe("FindGroupPage", () => {
  let component: FindGroupPage;
  let fixture: ComponentFixture<FindGroupPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindGroupPage],
    }).compileComponents();

    fixture = TestBed.createComponent(FindGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
