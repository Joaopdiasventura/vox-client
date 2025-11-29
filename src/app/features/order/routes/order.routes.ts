import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('../create/create-order-page/create-order-page.component').then(
        (m) => m.CreateOrderPageComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('../order-page/order-page.component').then(
        (m) => m.OrderPageComponent,
      ),
  },
];
