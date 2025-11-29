import { Component, inject, OnInit, signal } from '@angular/core';
import { ElectionService } from '../../../core/services/election/election.service';
import { SessionService } from '../../../core/services/session/session.service';
import { Election } from '../../../core/models/election';
import { Session } from '../../../core/models/session';
import { forkJoin, finalize } from 'rxjs';
import { ElectionCardComponent } from '../../../shared/components/cards/election-card/election-card.component';
import { SessionCardComponent } from '../../../shared/components/cards/session-card/session-card.component';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { User } from '../../../core/models/user';
import { Router, RouterLink } from '@angular/router';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';

@Component({
  selector: 'app-home-page',
  imports: [
    ElectionCardComponent,
    SessionCardComponent,
    CustomLinkComponent,
    RouterLink,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  public readonly user = signal<User | null>(null);
  public readonly elections = signal<Election[]>([]);
  public readonly sessions = signal<Session[]>([]);

  private readonly defaultDto = {
    page: 0,
    limit: 4,
    orderBy: 'createdAt:desc',
  };

  private readonly electionService = inject(ElectionService);
  private readonly sessionService = inject(SessionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly uiStateService = inject(UiStateService);

  public ngOnInit(): void {
    this.authService.user$.subscribe((u) => this.onUserLoaded(u));
  }

  public onUserLoaded(user: User | null): void {
    if (!user) return;
    this.user.set(user);

    const elections$ = this.electionService.findMany(this.defaultDto);
    const sessions$ = this.sessionService.findMany(this.defaultDto);

    this.uiStateService.setLoading(true);
    forkJoin({ elections: elections$, sessions: sessions$ })
      .pipe(finalize(() => this.uiStateService.setLoading(false)))
      .subscribe({
        next: ({ elections, sessions }) => {
          this.elections.set(elections);
          this.sessions.set(sessions);
        },
        error: () => {
          this.router.navigate(['/user', 'access']);
        },
      });
  }

  public changeLoading(loading: boolean): void {
    this.uiStateService.setLoading(loading);
  }

  public deleteSession(index: number): void {
    this.uiStateService.setLoading(true);
    this.sessions.update((prev) => prev.toSpliced(index, 1));
    this.sessionService
      .findMany(this.defaultDto)
      .pipe(finalize(() => this.uiStateService.setLoading(false)))
      .subscribe({
        next: (sessions) => this.sessions.set(sessions),
        error: () => {
          this.router.navigate(['/user', 'access']);
        },
      });
  }

  public deleteElection(index: number): void {
    this.uiStateService.setLoading(true);
    this.elections.update((prev) => prev.toSpliced(index, 1));
    this.electionService
      .findMany(this.defaultDto)
      .pipe(finalize(() => this.uiStateService.setLoading(false)))
      .subscribe({
        next: (elections) => this.elections.set(elections),
        error: () => {
          this.router.navigate(['/user', 'access']);
        },
      });
  }
}
