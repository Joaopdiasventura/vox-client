import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { forkJoin, map, Subject, takeUntil } from 'rxjs';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { SessionService } from '../../../core/services/session/session.service';
import { VoteService } from '../../../core/services/vote/vote.service';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';
import { Session } from '../../../core/models/session';
import { Candidate } from '../../../core/models/candidate';
import { SocketService } from '../../../core/services/socket/socket.service';
import { CandidateService } from '../../../core/services/candidate/candidate.service';
import { CustomButtonComponent } from '../../../shared/components/custom/custom-button/custom-button.component';
import { CreateBallotBoxDto } from '../../../shared/dto/ballot-box/create-ballot-box.dto';
import { BallotBox } from '../../../core/models/ballot-box';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { User } from '../../../core/models/user';
import { Message } from '../../../shared/interfaces/messages';
import { UpdateBallotBoxDto } from '../../../shared/dto/ballot-box/update-ballot-box.dto';
import { CreateVoteDto } from '../../../shared/dto/vote/create-vote.dto';
import { VoteStatus } from './types/vote-status';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    CustomLinkComponent,
    ReactiveFormsModule,
    CustomButtonComponent,
  ],
})
export class StartPageComponent implements OnInit, OnDestroy {
  public readonly status = signal<VoteStatus>('selecting');
  public readonly ended = signal(false);
  public readonly currentSession = signal<Session | null>(null);
  public readonly sessions = signal<Session[]>([]);
  public readonly candidates = signal<Record<string, Candidate[]>>({});
  public readonly nameControl = new FormControl('');
  public readonly sessionControl = new FormControl<Session | null>(null);
  public readonly ballotBox = signal<BallotBox | null>(null);
  public readonly creating = signal(false);
  public readonly submitting = signal(false);
  public readonly isWaitingAllow = computed(() => this.status() == 'blocked');
  public readonly overlayActive = computed(
    () =>
      this.status() != 'selecting' &&
      (this.isWaitingAllow() || this.submitting()),
  );

  private readonly destroy$ = new Subject<void>();
  private readonly uiStateService = inject(UiStateService);
  private readonly sessionService = inject(SessionService);
  private readonly candidateService = inject(CandidateService);
  private readonly voteService = inject(VoteService);
  private readonly socket = inject(SocketService);
  private readonly authService = inject(AuthService);
  private readonly candidateControls = new Map<
    string,
    FormControl<string | null>
  >();
  private readonly user = signal<User | null>(null);
  private readonly statusInternal = this.status;
  private startAfterCreate = false;
  private readonly selectedElections = new Set<string>();

  private pendingBallotSession: string | null = null;
  private pendingBallotName: string | null = null;
  private createdEvent?: string;
  private removedEvent?: string;
  private updateEvent?: string;
  private createdListener?: (ballot: BallotBox) => void;
  private removedListener?: (ballot: BallotBox) => void;
  private updatedListener?: (ballot: BallotBox) => void;

  public ngOnInit(): void {
    this.setStatus('selecting');
    this.uiStateService.setLoading(true);
    this.socket.open();

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.user.set(value));

    this.sessionControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.handleSessionChange(value));

    this.sessionService.findMany({}).subscribe({
      next: (result) => this.sessions.set(result),
      complete: () => this.uiStateService.setLoading(false),
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupListeners();
    this.socket.close();
    this.uiStateService.setNavbarVisible(true);
  }

  public qrCodeUrl(): string | null {
    if (!this.ballotBox()) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(this.ballotBox()!.id)}`;
  }

  public copyCode(): void {
    const code = this.ballotBox()?.id;
    if (!code) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      this.showSuccess('Codigo copiado');
    }
  }

  public electionNames(session: Session): string {
    return this.sessionService.getElectionNames(session.elections);
  }

  public candidateControl(electionId: string): FormControl<string | null> {
    const existing = this.candidateControls.get(electionId);
    if (existing) return existing;
    const control = new FormControl<string | null>(null);
    this.candidateControls.set(electionId, control);
    return control;
  }

  public canCreateBallotBox(): boolean {
    return (
      !!this.sessionControl.value &&
      !!this.nameControl.value?.trim() &&
      !this.creating() &&
      !this.ended()
    );
  }

  public onCreateAndStart(): void {
    this.startAfterCreate = true;
    if (this.ballotBox()) {
      this.setStatus('occurring');
      return;
    }
    this.createBallotBox();
  }

  public createBallotBox(): void {
    const session = this.sessionControl.value;
    const name = this.nameControl.value?.trim();
    const userId = this.user()?._id;

    if (!session || !name || !userId) {
      this.showError('Preencha o nome da urna e selecione uma sessão');
      return;
    }

    if (this.ended()) {
      this.showError('sessão encerrada, escolha outra sessão');
      return;
    }

    this.creating.set(true);
    this.pendingBallotSession = session._id;
    this.pendingBallotName = name;

    const dto: CreateBallotBoxDto = {
      user: userId,
      session: session._id,
      name,
    };

    this.socket.emit('createBallotBox', dto, (response: Message) => {
      this.creating.set(false);
      if (response?.message) {
        this.pendingBallotSession = null;
        this.pendingBallotName = null;
        this.showError(response.message);
        this.startAfterCreate = false;
        return;
      }
    });
  }

  public canSendVotes(): boolean {
    const ballot = this.ballotBox();
    const session = this.currentSession();
    const allSelected =
      !!session &&
      session.elections.every((election) =>
        this.selectedElections.has(election._id),
      );
    return (
      !!ballot &&
      !ballot.isBlocked &&
      !!session &&
      !this.ended() &&
      !this.submitting() &&
      this.status() == 'occurring' &&
      allSelected
    );
  }

  public sendVotes(): void {
    const session = this.currentSession();
    const ballot = this.ballotBox();
    if (!this.canSendVotes() || !session || !ballot) return;

    const voteRequests = session.elections.map((election) => {
      const candidate = this.candidateControl(election._id).value;
      const dto: CreateVoteDto = {
        session: session._id,
        election: election._id,
        candidate: candidate ?? null,
      };
      return this.voteService.create(dto);
    });

    if (!voteRequests.length) {
      this.showError('Nenhuma eleicao encontrada para esta sessão');
      return;
    }

    this.submitting.set(true);
    this.uiStateService.setLoading(true);

    forkJoin(voteRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.showSuccess('Votos enviados com sucesso'),
        error: ({ error }) =>
          this.showError(error?.message || 'Nao foi possivel enviar os votos'),
        complete: () => {
          this.uiStateService.setLoading(false);
          this.ballotBox.update((current) =>
            current ? { ...current, isBlocked: true } : current,
          );
          this.lockBallotAfterVote(session._id, ballot.id);
          this.resetCandidateSelection(session.elections);
          this.submitting.set(false);
          this.setStatus('blocked');
        },
      });
  }

  private handleSessionChange(value: Session | null): void {
    this.currentSession.set(value);
    this.candidates.set({});
    this.cleanupListeners();
    this.resetBallotState();
    if (!value) return;

    this.setEndedFromSession(value);
    this.subscribeToSessionEvents(value._id);
    const requests = value.elections.map((election) =>
      this.candidateService
        .findMany({ election: election._id })
        .pipe(map((list) => ({ election: election._id, list }))),
    );

    if (!requests.length) return;

    this.uiStateService.setLoading(true);
    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const mapped: Record<string, Candidate[]> = {};
          result.forEach(({ election, list }) => (mapped[election] = list));
          this.candidates.set(mapped);
          this.resetCandidateSelection(value.elections);
        },
        complete: () => this.uiStateService.setLoading(false),
      });
  }

  private resetCandidateSelection(elections: Session['elections'] = []): void {
    const allowed = new Set(elections.map((election) => election._id));
    Array.from(this.candidateControls.keys()).forEach((key) => {
      if (!allowed.has(key)) this.candidateControls.delete(key);
    });
    this.selectedElections.clear();
    elections.forEach((election) => {
      this.candidateControl(election._id).setValue(null);
    });
  }

  public selectCandidate(electionId: string, candidateId: string | null): void {
    this.candidateControl(electionId).setValue(candidateId);
    this.selectedElections.add(electionId);
  }

  private setEndedFromSession(session: Session): void {
    const endDate = new Date(session.endedAt).getTime();
    this.ended.set(endDate <= Date.now());
    if (this.ended()) {
      this.setStatus('ended');
      this.showError('sessão encerrada, selecione outra sessão.');
    }
  }

  private subscribeToSessionEvents(sessionId: string): void {
    this.cleanupSessionListeners();
    this.createdEvent = `ballot-box-created-${sessionId}`;
    this.removedEvent = `ballot-box-removed-${sessionId}`;

    this.createdListener = (ballot): void => {
      if (!this.pendingBallotSession) return;
      if (ballot.session != this.pendingBallotSession) return;
      if (this.pendingBallotName && ballot.name != this.pendingBallotName)
        return;
      this.attachBallotBox(ballot);
    };

    this.removedListener = (ballot): void => this.handleBallotRemoval(ballot);

    this.socket.on(this.createdEvent, this.createdListener);
    this.socket.on(this.removedEvent, this.removedListener);
  }

  private attachBallotBox(ballotBox: BallotBox): void {
    this.ballotBox.set(ballotBox);
    this.pendingBallotSession = null;
    this.pendingBallotName = null;
    if (this.startAfterCreate) {
      this.setStatus(ballotBox.isBlocked ? 'blocked' : 'occurring');
    } else {
      this.setStatus('selecting');
    }
    this.startAfterCreate = false;
    this.watchBallotUpdates(ballotBox.id);
  }

  private watchBallotUpdates(id: string): void {
    this.cleanupUpdateListener();
    this.updateEvent = `ballot-box-updated-${id}`;
    this.updatedListener = (ballot): void => this.handleBallotUpdate(ballot);
    this.socket.on(this.updateEvent, this.updatedListener);
  }

  private lockBallotAfterVote(session: string, id: string): void {
    const dto: UpdateBallotBoxDto = { session, id, isBlocked: true };
    this.socket.emit('updateBallotBox', dto);
  }

  private handleBallotUpdate(ballot: BallotBox): void {
    if (this.ballotBox()?.id != ballot.id) return;
    this.ballotBox.set(ballot);
    const currentStatus = this.status();
    if (currentStatus == 'occurring' || currentStatus == 'blocked') {
      this.setStatus(ballot.isBlocked ? 'blocked' : 'occurring');
    }
  }

  private handleBallotRemoval(ballot: BallotBox): void {
    if (this.ballotBox()?.id != ballot.id) return;
    this.ballotBox.set(null);
    this.setStatus('selecting');
    this.showError('Sua urna foi desconectada, crie outra para continuar');
  }

  private cleanupSessionListeners(): void {
    if (this.createdEvent && this.createdListener)
      this.socket.off(this.createdEvent, this.createdListener);
    if (this.removedEvent && this.removedListener)
      this.socket.off(this.removedEvent, this.removedListener);
    this.createdEvent = undefined;
    this.removedEvent = undefined;
    this.createdListener = undefined;
    this.removedListener = undefined;
  }

  private cleanupUpdateListener(): void {
    if (this.updateEvent && this.updatedListener)
      this.socket.off(this.updateEvent, this.updatedListener);
    this.updateEvent = undefined;
    this.updatedListener = undefined;
  }

  private cleanupListeners(): void {
    this.cleanupSessionListeners();
    this.cleanupUpdateListener();
  }

  private resetBallotState(): void {
    this.ballotBox.set(null);
    this.pendingBallotSession = null;
    this.pendingBallotName = null;
    this.setStatus('selecting');
    this.creating.set(false);
    this.submitting.set(false);
    this.cleanupUpdateListener();
  }

  private showError(message: string): void {
    this.uiStateService.setLoading(false);
    this.uiStateService.setModalConfig({
      icon: 'white/error',
      title: 'Ops! Algo deu errado',
      message,
      onClose: () => this.uiStateService.setModalConfig(null),
    });
  }

  private showSuccess(message: string): void {
    this.uiStateService.setModalConfig({
      icon: 'white/sucess',
      title: 'Tudo certo',
      message,
      onClose: () => this.uiStateService.setModalConfig(null),
    });
  }

  private setStatus(next: VoteStatus): void {
    this.statusInternal.set(next);
    const canShowNavbar = next == 'selecting' || next == 'ended';
    this.uiStateService.setNavbarVisible(canShowNavbar);
  }
}
