import { RenderMode, ServerRoute } from '@angular/ssr';

export const userServerRoutes: ServerRoute[] = [
  { path: 'user', renderMode: RenderMode.Client },
  {
    path: 'user/access',
    renderMode: RenderMode.Prerender,
  },
];
