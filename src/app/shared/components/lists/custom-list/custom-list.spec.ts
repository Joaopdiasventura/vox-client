import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CustomList } from "./custom-list";

describe("CustomList", () => {
  let component: CustomList;
  let fixture: ComponentFixture<CustomList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomList],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
