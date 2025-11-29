import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Observable,
  map,
  distinctUntilChanged,
  tap,
  filter,
  switchMap,
  catchError,
  finalize,
  EMPTY,
} from 'rxjs';
import { SessionService } from '../../../../core/services/session/session.service';
import { Session } from '../../../../core/models/session';
import { Election } from '../../../../core/models/election';
import { ElectionService } from '../../../../core/services/election/election.service';
import { SessionFormComponent } from '../../../../shared/components/forms/session-form/session-form.component';
import { IonContent } from '@ionic/angular/standalone';
import { UiStateService } from '../../../../shared/services/ui-state/ui-state.service';
import { CustomLinkComponent } from '../../../../shared/components/custom/custom-link/custom-link.component';

@Component({
  selector: 'app-upsert-session-page',
  templateUrl: './upsert-session-page.component.html',
  styleUrls: ['./upsert-session-page.component.scss'],
  imports: [SessionFormComponent, IonContent, CustomLinkComponent],
})
export class UpsertSessionPageComponent implements OnInit {
  public readonly session = signal<Session | null>(null);
  public readonly elections = signal<Election[]>([]);

  private readonly electionService = inject(ElectionService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly uiStateService = inject(UiStateService);

  public ngOnInit(): void {
    this.uiStateService.setLoading(true);
    this.watchRouteId();
  }

  public changeLoading(loading: boolean): void {
    this.uiStateService.setLoading(loading);
  }

  public get electionNames(): string {
    return this.sessionService.getElectionNames(this.session()!.elections);
  }

  private getRouteId$(): Observable<string | null> {
    return this.route.paramMap.pipe(
      map((params) => params.get('id')),
      distinctUntilChanged(),
    );
  }

  private watchRouteId(): void {
    this.getRouteId$()
      .pipe(
        tap((id) => {
          if (!id) this.loadElections();
        }),
        filter((id): id is string => !!id),
        tap(() => this.resetStateAndStartLoading()),
        switchMap((id) => this.loadSessionById$(id)),
      )
      .subscribe();
  }

  private loadSessionById$(id: string): Observable<Session> {
    return this.sessionService.findById(id).pipe(
      tap((result) => this.session.set(result)),
      catchError(() => this.navigateToAdd()),
      finalize(() => this.uiStateService.setLoading(false)),
    );
  }

  private loadElections(): void {
    this.electionService.findMany({ orderBy: 'name:asc' }).subscribe({
      next: (result) => this.elections.set(result),
      complete: () => this.uiStateService.setLoading(false),
    });
  }

  private resetStateAndStartLoading(): void {
    this.session.set(null);
    this.uiStateService.setLoading(true);
  }

  private navigateToAdd(): Observable<never> {
    this.router.navigate(['/Session', 'add']);
    return EMPTY;
  }
}
