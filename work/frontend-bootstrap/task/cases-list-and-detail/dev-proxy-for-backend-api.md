---
title: Dev-server proxy to the real backend
summary: A vite.config.ts server.proxy entry forwarding /v1/* to the real backend at http://localhost:3000, so a browser-side apiFetch call reaches it without a CORS rejection.
rationale: >-
  The inventory's own risk section confirmed, by curl, that the real backend sends no
  Access-Control-Allow-Origin header, and that apiFetch carries no base URL while
  vite.config.ts declares no server.proxy -- a browser-side call to the real backend fails
  today regardless of which screen makes it. I cut this as its own task rather than folding it
  into whichever screen task calls the backend first because it is a distinct interface (the
  dev server's own request path) that both Cases List and Case Detail consume identically as
  callers -- a task changing an interface and its consumers in the same breath is two tasks
  joined by a dependency, and here there are two consumers, not one, sharpening the same split.
  It is ordinary work, not the absent-substrate exemption: vite.config.ts already exists, only
  its server.proxy value is missing, and the standard's presupposed artifacts are all already
  present. It carries no implements because no specification node states a network path; the
  fix is what the scope itself calls infrastructure this wave's screens need to function, never
  a domain fact, and a production CORS change on the backend is explicitly out of scope.
objective: A browser-side request to /v1/* issued against the vite dev server at localhost:5173 reaches the real backend running at localhost:3000 and returns its response, with no CORS rejection blocking it.
criteria:
  - vite.config.ts declares a server.proxy entry forwarding requests whose path starts with /v1 to http://localhost:3000.
  - A request to http://localhost:5173/v1/cases, issued while the vite dev server and the real backend both run, returns the backend's own response body rather than a browser CORS error.
  - No file under the backend's own source root is changed by this task.
sources:
  - intake/onda-2-scope.md
---

## What it is
The one configuration change that lets any Onda 2 screen's apiFetch call actually reach the running backend during development, closing the CORS gap the inventory flagged.
It changes only vite.config.ts; the backend itself is never touched, since a production CORS change is explicitly out of this plan's scope.

## Notes
None.
