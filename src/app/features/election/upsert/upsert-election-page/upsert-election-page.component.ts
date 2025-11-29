import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import {
  map,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  finalize,
  filter,
} from 'rxjs/operators';

import { ElectionService } from '../../../../core/services/election/election.service';
import { Election } from '../../../../core/models/election';
import { ElectionFormComponent } from '../../../../shared/components/forms/election-form/election-form.component';
import { IonContent } from '@ionic/angular/standalone';
import { UiStateService } from '../../../../shared/services/ui-state/ui-state.service';
import { CustomLinkComponent } from '../../../../shared/components/custom/custom-link/custom-link.component';

@Component({
  selector: 'app-upsert-election-page',
  templateUrl: './upsert-election-page.component.html',
  styleUrls: ['./upsert-election-page.component.scss'],
  imports: [ElectionFormComponent, IonContent, CustomLinkComponent],
})
export class UpsertElectionPageComponent implements OnInit {
  public readonly election = signal<Election | null>(null);

  private readonly electionService = inject(ElectionService);
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
          if (!id) return;
        }),
        filter((id): id is string => !!id),
        tap(() => this.resetStateAndStartLoading()),
        switchMap((id) => this.loadElectionById$(id)),
      )
      .subscribe();
  }

  private loadElectionById$(id: string): Observable<Election> {
    return this.electionService.findById(id).pipe(
      tap((result) => this.election.set(result)),
      catchError(() => this.navigateToList()),
      finalize(() => this.uiStateService.setLoading(false)),
    );
  }

  private resetStateAndStartLoading(): void {
    this.election.set(null);
    this.uiStateService.setLoading(true);
  }

  private navigateToList(): Observable<never> {
    this.router.navigate(['/election']);
    return EMPTY;
  }
}
