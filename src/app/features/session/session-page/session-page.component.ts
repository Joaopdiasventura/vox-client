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
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../core/services/session/session.service';
import { Session } from '../../../core/models/session';
import { IonContent } from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { SessionCardComponent } from '../../../shared/components/cards/session-card/session-card.component';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { Election } from '../../../core/models/election';
import { ElectionService } from '../../../core/services/election/election.service';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';

@Component({
  selector: 'app-session-page',
  templateUrl: './session-page.component.html',
  styleUrls: ['./session-page.component.scss'],
  imports: [CustomLinkComponent, SessionCardComponent, IonContent],
})
export class SessionPageComponent
  implements ViewWillEnter, AfterViewInit, OnDestroy
{
  @ViewChildren('cardRef', { read: ElementRef })
  private cardElements!: QueryList<ElementRef>;

  public readonly canLoadMore = signal<boolean>(true);
  public readonly sessions = signal<Session[]>([]);
  private readonly election = signal<Election | null>(null);
  private readonly page = signal<number>(0);
  private readonly limit = 10;
  private readonly isFetching = signal<boolean>(false);

  private readonly sessionService = inject(SessionService);
  private readonly electionService = inject(ElectionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly uiStateService = inject(UiStateService);
  private observer?: IntersectionObserver;

  public ionViewWillEnter(): void {
    this.uiStateService.setLoading(true);
    this.resetPagination();
    const electionId = this.route.snapshot.queryParamMap.get('election');
    if (electionId) this.loadElection(electionId);
    else this.loadPage();
  }

  public ngAfterViewInit(): void {
    this.setupObserver();
  }

  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  public get title(): string {
    if (!this.sessions().length) return 'Nenhuma sessǜo encontrada';
    if (!this.election()) return 'Sessões';
    return 'Sessões de ' + this.election()!.name;
  }

  public delete(index: number): void {
    this.sessions.update((prev) => prev.toSpliced(index, 1));
    this.observeLastCard();
  }

  public changeLoading(loading: boolean): void {
    this.uiStateService.setLoading(loading);
  }

  public get getElection(): Election | boolean {
    if (this.election()) return this.election()!;
    return false;
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

  private resetPagination(): void {
    this.sessions.set([]);
    this.page.set(0);
    this.canLoadMore.set(true);
    this.election.set(null);
    this.observeLastCard();
  }

  private loadPage(): void {
    if (this.isFetching() || !this.canLoadMore()) return;
    this.isFetching.set(true);
    this.sessionService
      .findMany({
        page: this.page(),
        limit: this.limit,
        orderBy: '_id:desc',
        election: this.election() ? this.election()?._id : undefined,
      })
      .subscribe({
        next: (result) => {
          this.sessions.update((prev) => [...prev, ...result]);
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
          if (entry.isIntersecting) this.loadPage();
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
