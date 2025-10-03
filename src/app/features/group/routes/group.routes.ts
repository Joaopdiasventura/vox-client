import { Routes } from '@angular/router';
import { GroupPage } from '../group-page/group-page';
import { AuthGuard } from '../../../core/guards/auth/auth-guard';

export const groupRoutes: Routes = [
  {
    path: '',
    component: GroupPage,
    canActivate: [AuthGuard],
  },
];
