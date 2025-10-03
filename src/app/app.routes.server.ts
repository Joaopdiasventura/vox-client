import { RenderMode, ServerRoute } from '@angular/ssr';
import { userServerRoutes } from './features/user/routes/user.routes.server';
import { groupServerRoutes } from './features/group/routes/group.routes.server';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client,
  },
  ...userServerRoutes,
  ...groupServerRoutes,
];
