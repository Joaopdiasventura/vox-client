import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'allow',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../allow-page/allow-page.component').then(
        (m) => m.AllowPageComponent,
      ),
  },
  {
    path: 'start',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../start-page/start-page.component').then(
        (m) => m.StartPageComponent,
      ),
  },
  {
    path: 'track',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../track-page/track-page.component').then(
        (m) => m.TrackPageComponent,
      ),
  },
];
