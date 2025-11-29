import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  path: string[];
}

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterModule],
})
export class NavbarComponent {
  public readonly currentIndex = signal<number>(2);
  public readonly isFabOpen = signal<boolean>(false);

  private readonly router = inject(Router);
  private readonly centerIndex = 2;

  public constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => this.onCurrentRouteChange(event.urlAfterRedirects));
  }

  public desktopSections: NavItem[][] = [
    [
      {
        label: 'página inicial',
        icon: 'assets/svg/red/home.svg',
        path: ['/'],
      },
      {
        label: 'ver perfil',
        icon: 'assets/svg/red/person.svg',
        path: ['/user'],
      },
    ],
    [
      {
        label: 'iniciar votação',
        icon: 'assets/svg/red/start-vote.svg',
        path: ['/vote', 'start'],
      },
      {
        label: 'acompanhar votação',
        icon: 'assets/svg/red/track-vote.svg',
        path: ['/vote', 'track'],
      },
      {
        label: 'autorizar voto',
        icon: 'assets/svg/red/allow-vote.svg',
        path: ['/vote', 'allow'],
      },
    ],
    [
      {
        label: 'ver eleições',
        icon: 'assets/svg/red/troph.svg',
        path: ['/election'],
      },
      {
        label: 'ver sessões',
        icon: 'assets/svg/red/see-sessions.svg',
        path: ['/session'],
      },
    ],
    [
      {
        label: 'adicionar eleição',
        icon: 'assets/svg/red/add-candidate.svg',
        path: ['/election', 'add'],
      },
      {
        label: 'adicionar sessão',
        icon: 'assets/svg/red/add-session.svg',
        path: ['/session', 'add'],
      },
      {
        label: 'adicionar candidato',
        icon: 'assets/svg/red/add-candidate.svg',
        path: ['/candidate', 'add'],
      },
    ],
  ];

  public fabLinks: NavItem[] = [
    {
      label: 'adicionar eleição',
      icon: 'assets/svg/red/add-candidate.svg',
      path: ['/election', 'add'],
    },
    {
      label: 'ver eleições',
      icon: 'assets/svg/red/troph.svg',
      path: ['/election'],
    },
    {
      label: 'ver sessões',
      icon: 'assets/svg/red/see-sessions.svg',
      path: ['/session'],
    },
    {
      label: 'adicionar sessão',
      icon: 'assets/svg/red/add-session.svg',
      path: ['/session', 'add'],
    },
  ];

  public items: NavItem[] = [
    {
      label: 'Iniciar',
      icon: 'assets/svg/red/start-vote.svg',
      path: ['/vote', 'start'],
    },
    {
      label: 'Acompanhar',
      icon: 'assets/svg/red/track-vote.svg',
      path: ['/vote', 'track'],
    },
    {
      label: '',
      icon: 'assets/svg/red/home.svg',
      path: ['/'],
    },
    {
      label: 'Autorizar',
      icon: 'assets/svg/red/allow-vote.svg',
      path: ['/vote', 'allow'],
    },
    {
      label: 'Perfil',
      icon: 'assets/svg/red/person.svg',
      path: ['/user'],
    },
  ];

  public get fabItems(): NavItem[] {
    return this.items.filter((_, index) => index != this.centerIndex);
  }

  public onItemClick(index: number): void {
    if (index == this.centerIndex && this.isOnHome)
      this.isFabOpen.update((prev) => !prev);
    else this.isFabOpen.set(false);
  }

  public closeFab(): void {
    console.log('opa');

    this.isFabOpen.set(false);
  }

  public get isOnHome(): boolean {
    const url = this.router.url.split('?')[0];
    return url == '/' || url == '/home';
  }

  private onCurrentRouteChange(url: string): void {
    const index = this.items.findIndex((item) => {
      if (item.path.includes(':'))
        return url.startsWith(item.path.join('/').split('/:')[0]);
      return url == item.path.join('/');
    });

    this.currentIndex.set(index >= 0 ? index : this.centerIndex);
  }
}
