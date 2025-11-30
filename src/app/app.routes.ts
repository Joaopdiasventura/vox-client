import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth/auth-guard';
import { HomePageComponent } from './features/home/home-page/home-page.component';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: HomePageComponent,
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./features/user/routes/user.routes').then((m) => m.routes),
  },
  {
    path: 'election',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/election/routes/election.routes').then(
        (m) => m.routes,
      ),
  },
  {
    path: 'session',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/session/routes/session.routes').then((m) => m.routes),
  },
  {
    path: 'candidate',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/candidate/routes/candidate.routes').then(
        (m) => m.routes,
      ),
  },
  {
    path: 'order',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/order/routes/order.routes').then((m) => m.routes),
  },
  {
    path: 'vote',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/vote/routes/vote.routes').then((m) => m.routes),
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
