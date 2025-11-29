import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../session-page/session-page.component').then(
        (m) => m.SessionPageComponent,
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import(
        '../upsert/upsert-session-page/upsert-session-page.component'
      ).then((m) => m.UpsertSessionPageComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () =>
      import(
        '../upsert/upsert-session-page/upsert-session-page.component'
      ).then((m) => m.UpsertSessionPageComponent),
  },
];
