import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StartPageComponent } from './start-page.component';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';
import { SessionService } from '../../../core/services/session/session.service';
import { CandidateService } from '../../../core/services/candidate/candidate.service';
import { VoteService } from '../../../core/services/vote/vote.service';
import { SocketService } from '../../../core/services/socket/socket.service';
import { AuthService } from '../../../core/services/user/auth/auth.service';

describe('StartPageComponent', () => {
  let component: StartPageComponent;
  let fixture: ComponentFixture<StartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartPageComponent],
      providers: [
        { provide: UiStateService, useValue: { setLoading: () => {}, setModalConfig: () => {} } },
        { provide: SessionService, useValue: { findMany: () => of([]), getElectionNames: () => '' } },
        { provide: CandidateService, useValue: { findMany: () => of([]) } },
        { provide: VoteService, useValue: { create: () => of({ message: '' }) } },
        {
          provide: SocketService,
          useValue: { open: () => {}, emit: () => {}, on: () => {}, off: () => {}, close: () => {} },
        },
        { provide: AuthService, useValue: { user$: of(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
