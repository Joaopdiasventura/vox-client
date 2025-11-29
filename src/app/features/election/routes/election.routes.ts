import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../election-page/election-page.component').then(
        (m) => m.ElectionPageComponent,
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import(
        '../upsert/upsert-election-page/upsert-election-page.component'
      ).then((m) => m.UpsertElectionPageComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () =>
      import(
        '../upsert/upsert-election-page/upsert-election-page.component'
      ).then((m) => m.UpsertElectionPageComponent),
  },
];
