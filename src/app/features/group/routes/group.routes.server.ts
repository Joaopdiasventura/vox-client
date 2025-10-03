import { RenderMode, ServerRoute } from '@angular/ssr';

export const groupServerRoutes: ServerRoute[] = [{ path: 'group', renderMode: RenderMode.Client }];
