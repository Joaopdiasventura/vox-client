import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPage } from './group-page';

describe('GroupPage', () => {
  let component: GroupPage;
  let fixture: ComponentFixture<GroupPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
