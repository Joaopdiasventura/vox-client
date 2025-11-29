import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { App } from '@capacitor/app';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { filter } from 'rxjs/operators';
import { ModalComponent } from './shared/components/modal/modal.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { UiStateService } from './shared/services/ui-state/ui-state.service';
import { ModalConfig } from './shared/interfaces/config/ui/modal';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp,
    IonRouterOutlet,
    NavbarComponent,
    ModalComponent,
    LoadingComponent,
  ],
})
export class AppComponent implements OnInit {
  public readonly showNavBar = signal<boolean>(false);
  public readonly modalConfig = signal<ModalConfig | null>(null);
  public readonly isLoading = signal<boolean>(false);
  private allowNavbarByState = true;
  private allowNavbarByRoute = true;

  private readonly excludedRoutes = [
    '/user/access',
    '/user/access/validate/:token',
  ];

  private readonly desktopBreakpoint = 768;

  private readonly uiStateService = inject(UiStateService);
  private readonly router = inject(Router);

  public constructor() {
    App.addListener('appUrlOpen', ({ url }) => {
      const path = new URL(url).pathname;
      this.router.navigateByUrl(path);
    });
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => this.onCurrentRouteChange(event.urlAfterRedirects));
  }

  public ngOnInit(): void {
    this.uiStateService.isLoading.subscribe((isLoading) =>
      this.isLoading.set(isLoading),
    );
    this.uiStateService.modalConfig.subscribe((modalConfig) =>
      this.modalConfig.set(modalConfig),
    );
    this.uiStateService.isNavbarVisible.subscribe((visible) => {
      this.allowNavbarByState = visible;
      this.updateNavbarVisibility();
    });
  }

  private onCurrentRouteChange(url: string): void {
    this.uiStateService.setLoading(false);

    const isExcluded = this.excludedRoutes.some((route) => {
      if (route.includes(':')) return url.startsWith(route.split('/:')[0]);
      return url == route;
    });

    const isHome = url.startsWith('/home');

    const isDesktop = window.innerWidth > this.desktopBreakpoint;

    this.allowNavbarByRoute = !isExcluded && !(isHome && isDesktop);
    this.updateNavbarVisibility();
  }

  private updateNavbarVisibility(): void {
    this.showNavBar.set(this.allowNavbarByRoute && this.allowNavbarByState);
  }
}
