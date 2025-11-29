import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Candidate } from '../../../core/models/candidate';
import { Election } from '../../../core/models/election';
import { ElectionService } from '../../../core/services/election/election.service';
import { CandidateService } from '../../../core/services/candidate/candidate.service';
import { IonContent } from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { CandidateCardComponent } from '../../../shared/components/cards/candidate-card/candidate-card.component';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';

@Component({
  selector: 'app-candidate-page',
  templateUrl: './candidate-page.component.html',
  styleUrls: ['./candidate-page.component.scss'],
  imports: [CustomLinkComponent, CandidateCardComponent, IonContent],
})
export class CandidatePageComponent
  implements ViewWillEnter, AfterViewInit, OnDestroy
{
  @ViewChildren('cardRef', { read: ElementRef })
  private cardElements!: QueryList<ElementRef>;

  public readonly canLoadMore = signal<boolean>(true);
  public readonly candidates = signal<Candidate[]>([]);
  public readonly election = signal<Election>({} as Election);
  private readonly page = signal<number>(0);
  private readonly limit = 10;
  private readonly isFetching = signal<boolean>(false);

  private readonly candidateService = inject(CandidateService);
  private readonly electionService = inject(ElectionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly uiStateService = inject(UiStateService);
  private observer?: IntersectionObserver;

  public ionViewWillEnter(): void {
    this.resetPagination();
    const electionId = this.route.snapshot.paramMap.get('election');
    if (!electionId) {
      this.router.navigate(['/candidate/add']);
      return;
    }
    this.uiStateService.setLoading(true);
    this.loadElection(electionId);
  }

  public ngAfterViewInit(): void {
    this.setupObserver();
  }

  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  public delete(index: number): void {
    this.candidates.update((prev) => prev.toSpliced(index, 1));
    this.observeLastCard();
  }

  public changeLoading(loading: boolean): void {
    this.uiStateService.setLoading(loading);
  }

  private resetPagination(): void {
    this.candidates.set([]);
    this.page.set(0);
    this.canLoadMore.set(true);
    this.election.set({} as Election);
    this.observeLastCard();
  }

  private loadElection(election: string): void {
    this.electionService.findById(election).subscribe({
      next: (result) => this.election.set(result),
      error: () => {
        this.router.navigate(['/session']);
      },
      complete: () => this.loadPage(),
    });
  }

  private loadPage(): void {
    if (this.isFetching() || !this.canLoadMore()) return;
    this.isFetching.set(true);
    this.uiStateService.setLoading(true);
    this.candidateService
      .findMany({
        page: this.page(),
        limit: this.limit,
        orderBy: '_id:desc',
        election: this.election()._id,
      })
      .subscribe({
        next: (result) => {
          this.candidates.update((prev) => [...prev, ...result]);
          this.page.update((p) => p + 1);
          if (result.length < this.limit) this.canLoadMore.set(false);
          this.observeLastCard();
        },
        error: () => this.canLoadMore.set(false),
        complete: () => {
          this.uiStateService.setLoading(false);
          this.isFetching.set(false);
        },
      });
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadPage();
          }
        });
      },
      { threshold: 0.5 },
    );

    this.cardElements.changes.subscribe(() => this.observeLastCard());
    this.observeLastCard();
  }

  private observeLastCard(): void {
    if (!this.observer) return;
    this.observer.disconnect();
    const last = this.cardElements?.last?.nativeElement as Element | undefined;
    if (last) this.observer.observe(last);
  }
}
