import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddParticipantPageComponent } from './add-participant-page.component';

describe('AddParticipantPageComponent', () => {
  let component: AddParticipantPageComponent;
  let fixture: ComponentFixture<AddParticipantPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddParticipantPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddParticipantPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
