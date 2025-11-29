import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../user-page/user-page.component').then(
        (m) => m.UserPageComponent,
      ),
  },
  {
    path: 'access',
    loadComponent: () =>
      import('../access/access-page/access-page.component').then(
        (m) => m.AccessPageComponent,
      ),
  },
  {
    path: 'access/validate/:token',
    loadComponent: () =>
      import('../access/validate/validate-page/validate-page.component').then(
        (m) => m.ValidatePageComponent,
      ),
  },
];
