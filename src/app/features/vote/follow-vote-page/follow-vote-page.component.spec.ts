import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowVotePageComponent } from './follow-vote-page.component';

describe('FollowVotePageComponent', () => {
  let component: FollowVotePageComponent;
  let fixture: ComponentFixture<FollowVotePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowVotePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowVotePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
