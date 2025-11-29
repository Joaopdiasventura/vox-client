import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session/session.service';
import { VoteService } from '../../../core/services/vote/vote.service';
import { CandidateService } from '../../../core/services/candidate/candidate.service';
import { Session } from '../../../core/models/session';
import { VoteResult } from '../../../core/models/vote';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { SocketService } from '../../../core/services/socket/socket.service';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { Candidate } from '../../../core/models/candidate';

interface ElectionBucket {
  electionId: string;
  electionName: string;
  total: number;
  results: { name: string; quantity: number }[];
}

@Component({
  selector: 'app-track-page',
  templateUrl: './track-page.component.html',
  styleUrls: ['./track-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSelect,
    IonSelectOption,
    ReactiveFormsModule,
    CustomLinkComponent,
  ],
})
export class TrackPageComponent implements OnInit, OnDestroy {
  public readonly sessions = signal<Session[]>([]);
  public readonly sessionControl = new FormControl<Session | null>(null);
  public readonly buckets = signal<ElectionBucket[]>([]);
  public readonly totalVotes = signal(0);
  public readonly currentSession = signal<Session | null>(null);
  public readonly candidatesByElection = signal<Record<string, Candidate[]>>(
    {},
  );

  private readonly sessionService = inject(SessionService);
  private readonly voteService = inject(VoteService);
  private readonly candidateService = inject(CandidateService);
  private readonly uiStateService = inject(UiStateService);
  private readonly socket = inject(SocketService);
  private readonly destroy$ = new Subject<void>();
  private voteEvent?: string;
  private voteListener?: () => void;

  public ngOnInit(): void {
    this.uiStateService.setLoading(true);
    this.socket.open();
    this.sessionControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((session) => this.handleSessionChange(session));

    this.sessionService.findMany({}).subscribe({
      next: (result) => this.sessions.set(result),
      complete: () => this.uiStateService.setLoading(false),
    });
  }

  public ngOnDestroy(): void {
    this.cleanupListener();
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.close();
  }

  public electionNames(session: Session): string {
    return this.sessionService.getElectionNames(session.elections);
  }

  private handleSessionChange(session: Session | null): void {
    this.cleanupListener();
    this.buckets.set([]);
    this.totalVotes.set(0);
    this.candidatesByElection.set({});
    if (!session) return;
    this.uiStateService.setLoading(true);
    this.sessionService.findById(session._id).subscribe({
      next: (result) => this.currentSession.set(result),
      error: () => {
        this.currentSession.set(null);
        this.uiStateService.setLoading(false);
      },
      complete: () => {
        this.fetchCandidatesAndResults(session._id);
        this.voteEvent = `vote-${session._id}`;
        this.voteListener = (): void =>
          this.fetchCandidatesAndResults(session._id);
        this.socket.on(this.voteEvent, this.voteListener);
      },
    });
  }

  private fetchCandidatesAndResults(sessionId: string): void {
    const session = this.currentSession();
    if (!session) {
      this.uiStateService.setLoading(false);
      return;
    }

    const requests = session.elections.map((election) =>
      this.candidateService.findMany({ election: election._id }),
    );

    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (candidatesLists: Candidate[][]) => {
          const byElection: Record<string, Candidate[]> = {};
          session.elections.forEach((election, index) => {
            byElection[election._id] = candidatesLists[index];
          });
          this.candidatesByElection.set(byElection);
        },
        complete: () => this.fetchResults(sessionId),
        error: () => this.uiStateService.setLoading(false),
      });
  }

  private fetchResults(sessionId: string): void {
    this.voteService
      .findResult(sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => this.mapResults(results),
        complete: () => this.uiStateService.setLoading(false),
        error: () => this.uiStateService.setLoading(false),
      });
  }

  private mapResults(results: VoteResult[]): void {
    const bucketsMap = new Map<string, ElectionBucket>();
    let total = 0;
    const session = this.currentSession();

    const sessionElectionIds = new Set(
      (session?.elections || []).map((election) => election._id),
    );

    const electionNameById = new Map(
      (session?.elections || []).map((e) => [e._id, e.name]),
    );

    results.forEach((item) => {
      total += item.quantity;
      const electionId = item.election || 'null';
      const electionName = electionNameById.get(electionId) || 'Votos nulos';
      const bucket =
        bucketsMap.get(electionId) ||
        ({
          electionId,
          electionName,
          total: 0,
          results: [],
        } as ElectionBucket);

      const name = item.candidate?.name || 'Nulo/Branco';
      bucket.results.push({ name, quantity: item.quantity });
      bucket.total += item.quantity;
      bucketsMap.set(electionId, bucket);
    });

    const withZeroCandidates = session?.elections.map((election) => {
      const bucket = bucketsMap.get(election._id) || {
        electionId: election._id,
        electionName: election.name,
        total: 0,
        results: [],
      };
      const candidates = this.candidatesByElection()[election._id] || [];
      const existingNames = new Set(bucket.results.map((r) => r.name));
      candidates.forEach((cand) => {
        if (!existingNames.has(cand.name))
          bucket.results.push({ name: cand.name, quantity: 0 });
      });
      bucket.results.sort((a, b) => b.quantity - a.quantity);
      return bucket;
    });

    const extraBuckets = Array.from(bucketsMap.values())
      .filter((bucket) => !sessionElectionIds.has(bucket.electionId))
      .map((bucket) => ({
        ...bucket,
        results: [...bucket.results].sort((a, b) => b.quantity - a.quantity),
      }));

    this.buckets.set(
      (withZeroCandidates || []).concat(extraBuckets as ElectionBucket[]),
    );
    this.totalVotes.set(total);
  }

  private cleanupListener(): void {
    if (this.voteEvent && this.voteListener)
      this.socket.off(this.voteEvent, this.voteListener);
    this.voteEvent = undefined;
    this.voteListener = undefined;
  }
}
