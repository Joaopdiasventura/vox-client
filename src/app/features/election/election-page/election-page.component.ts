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
import { ElectionService } from '../../../core/services/election/election.service';
import { IonContent } from '@ionic/angular/standalone';
import { ViewWillEnter } from '@ionic/angular';
import { ElectionCardComponent } from '../../../shared/components/cards/election-card/election-card.component';
import { Election } from '../../../core/models/election';
import { CustomLinkComponent } from '../../../shared/components/custom/custom-link/custom-link.component';
import { UiStateService } from '../../../shared/services/ui-state/ui-state.service';

@Component({
  selector: 'app-election-page',
  templateUrl: './election-page.component.html',
  styleUrls: ['./election-page.component.scss'],
  imports: [ElectionCardComponent, IonContent, CustomLinkComponent],
})
export class ElectionPageComponent
  implements ViewWillEnter, AfterViewInit, OnDestroy
{
  @ViewChildren('cardRef', { read: ElementRef })
  private cardElements!: QueryList<ElementRef>;

  public readonly canLoadMore = signal<boolean>(true);
  public readonly elections = signal<Election[]>([]);
  private readonly page = signal<number>(0);
  private readonly limit = 10;
  private readonly isFetching = signal<boolean>(false);

  private readonly electionService = inject(ElectionService);
  private readonly uiStateService = inject(UiStateService);
  private observer?: IntersectionObserver;

  public ionViewWillEnter(): void {
    this.resetAndLoad();
  }

  public ngAfterViewInit(): void {
    this.setupObserver();
  }

  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private resetAndLoad(): void {
    this.resetPagination();
    this.loadPage();
  }

  public delete(index: number): void {
    this.elections.update((prev) => prev.toSpliced(index, 1));
    this.observeLastCard();
  }

  public changeLoading(loading: boolean): void {
    this.uiStateService.setLoading(loading);
  }

  private resetPagination(): void {
    this.elections.set([]);
    this.page.set(0);
    this.canLoadMore.set(true);
    this.observeLastCard();
  }

  private loadPage(): void {
    if (this.isFetching() || !this.canLoadMore()) return;
    this.isFetching.set(true);
    this.uiStateService.setLoading(true);
    this.electionService
      .findMany({
        page: this.page(),
        limit: this.limit,
        orderBy: '_id:desc',
      })
      .subscribe({
        next: (result) => {
          this.elections.update((prev) => [...prev, ...result]);
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
