import { RenderMode, ServerRoute } from "@angular/ssr";

export const serverRoutes: ServerRoute[] = [
  { path: "", renderMode: RenderMode.Server },
  { path: "access", renderMode: RenderMode.Prerender },
  { path: "verify/email", renderMode: RenderMode.Prerender },
  { path: "group/add", renderMode: RenderMode.Prerender },
  { path: "group/:id", renderMode: RenderMode.Server },
  { path: "participant/add", renderMode: RenderMode.Prerender },
  { path: "vote", renderMode: RenderMode.Server },
  { path: "votes/follow", renderMode: RenderMode.Server },
  { path: "votes/allow", renderMode: RenderMode.Server },
];
