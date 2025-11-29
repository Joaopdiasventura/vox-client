import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TrackPageComponent } from './track-page.component';
import { SessionService } from '../../../core/services/session/session.service';
import { VoteService } from '../../../core/services/vote/vote.service';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';
import { SocketService } from '../../../core/services/socket/socket.service';

describe('TrackPageComponent', () => {
  let component: TrackPageComponent;
  let fixture: ComponentFixture<TrackPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackPageComponent],
      providers: [
        { provide: SessionService, useValue: { findMany: () => of([]), getElectionNames: () => '', findById: () => of(null) } },
        { provide: VoteService, useValue: { findResult: () => of([]) } },
        { provide: UiStateService, useValue: { setLoading: () => {}, setNavbarVisible: () => {}, setModalConfig: () => {} } },
        { provide: SocketService, useValue: { open: () => {}, emit: () => {}, on: () => {}, off: () => {}, close: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
