import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ModalQuestion } from "./modal-question";

describe("ModalQuestion", () => {
  let component: ModalQuestion;
  let fixture: ComponentFixture<ModalQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
