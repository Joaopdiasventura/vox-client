import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/home/home-page/home-page').then(({ HomePage }) => HomePage),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./features/user/routes/user.routes').then(({ userRoutes }) => userRoutes),
  },
  {
    path: 'group',
    loadChildren: () =>
      import('./features/group/routes/group.routes').then(({ groupRoutes }) => groupRoutes),
  },
];
