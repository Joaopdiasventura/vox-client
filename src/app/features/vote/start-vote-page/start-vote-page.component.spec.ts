import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartVotePageComponent } from './start-vote-page.component';

describe('StartVotePageComponent', () => {
  let component: StartVotePageComponent;
  let fixture: ComponentFixture<StartVotePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartVotePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartVotePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
