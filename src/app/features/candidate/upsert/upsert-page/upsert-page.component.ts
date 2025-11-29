import { Component, inject, OnInit, signal } from '@angular/core';
import { Candidate } from '../../../../core/models/candidate';
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
import { Election } from '../../../../core/models/election';
import { CandidateService } from '../../../../core/services/candidate/candidate.service';
import { ElectionService } from '../../../../core/services/election/election.service';
import { CandidateFormComponent } from '../../../../shared/components/forms/candidate-form/candidate-form.component';
import { UiStateService } from '../../../../shared/services/ui-state/ui-state.service';
import { IonContent } from '@ionic/angular/standalone';
import { CustomLinkComponent } from '../../../../shared/components/custom/custom-link/custom-link.component';

@Component({
  selector: 'app-upsert-page',
  templateUrl: './upsert-page.component.html',
  styleUrls: ['./upsert-page.component.scss'],
  imports: [CandidateFormComponent, IonContent, CustomLinkComponent],
})
export class UpsertPageComponent implements OnInit {
  public readonly candidate = signal<Candidate | null>(null);
  public readonly elections = signal<Election[]>([]);

  private readonly electionService = inject(ElectionService);
  private readonly candidateService = inject(CandidateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly uiStateService = inject(UiStateService);

  public ngOnInit(): void {
    this.uiStateService.setLoading(true);
    this.watchRouteId();
  }

  public get backLink(): string[] {
    if (this.candidate()) return ['/candidate', this.candidate()!.election._id];
    return ['/election'];
  }

  public changeLoading(loading: boolean): void {
    this.uiStateService.setLoading(loading);
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
        tap(() => this.loadElections()),
        filter((id): id is string => !!id),
        tap(() => this.resetStateAndStartLoading()),
        switchMap((id) => this.loadCandidateById$(id)),
      )
      .subscribe();
  }

  private loadCandidateById$(id: string): Observable<Candidate> {
    return this.candidateService.findById(id).pipe(
      tap((result) => this.candidate.set(result)),
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
    this.candidate.set(null);
    this.uiStateService.setLoading(true);
  }

  private navigateToAdd(): Observable<never> {
    this.router.navigate(['/Candidate', 'add']);
    return EMPTY;
  }
}
