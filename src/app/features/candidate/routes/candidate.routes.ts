import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'add',
    loadComponent: () =>
      import('../upsert/upsert-page/upsert-page.component').then(
        (m) => m.UpsertPageComponent,
      ),
  },
  {
    path: 'update/:id',
    loadComponent: () =>
      import('../upsert/upsert-page/upsert-page.component').then(
        (m) => m.UpsertPageComponent,
      ),
  },
  {
    path: ':election',
    loadComponent: () =>
      import('../candidate-page/candidate-page.component').then(
        (m) => m.CandidatePageComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'add',
    pathMatch: 'full',
  },
];
