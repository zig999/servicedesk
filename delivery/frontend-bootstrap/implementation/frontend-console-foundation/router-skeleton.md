---
title: Route tree skeleton for the ten proposal screens
summary: A flat @tanstack/react-router route tree with one placeholder route per proposal screen 2.1 through 2.10, wired as the single RouterProvider at the app's entry point, with no layout composed around any of them yet.
task: sha256:f09bda77c9b999ce13428fb74285d7a15d13ab34184a1a34476d2cb43f83857f
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:154d391b6346febbd273d5806c95730da5db7e6ffa3df544a9792398002295e5
run: run/frontend-console-foundation-onda-1-full-suite-2
files:
  - path: src/routes/route-placeholders.tsx
    effect: exports ten distinct placeholder components, one per proposal screen, each rendering only its own literal identifying text with no shared markup or layout
  - path: src/routes/route-tree.tsx
    effect: builds a flat route tree -- a componentless root route (bare Outlet) with ten leaf routes as its direct children, each pointing at exactly one placeholder -- and creates/exports the typed router instance, registered against @tanstack/react-router's Register interface
  - path: src/main.tsx
    effect: mounts a single RouterProvider (given the router from route-tree.tsx) inside StrictMode at #root, after importing the design-system token stylesheet
  - path: package.json
    effect: declares @tanstack/react-router as a direct dependency at ^1.95.0, matching the version TUI's own package.json already pins
criteria:
  - criterion: Each of the ten screens (2.1 through 2.10) named in the proposal has its own route path defined in the router tree.
    met: true
    how: route-tree.tsx defines exactly ten leaf routes as children of the root route, each with its own distinct path string, all passed to rootRoute.addChildren([...])
  - criterion: Visiting each defined route renders that route's own placeholder component, distinct from every other route's placeholder.
    met: true
    how: each leaf route's component field names one of the ten exports from route-placeholders.tsx; no two routes share a component, and each placeholder returns its own distinguishable literal text
  - criterion: No route composes a layout beyond its own placeholder content in this task.
    met: true
    how: createRootRoute() is called with no component (defaults to a bare Outlet), and every leaf route's component is exactly its placeholder function with nothing wrapping it
  - criterion: The router is wired as the single RouterProvider mounted at the app's entry point, using @tanstack/react-router at the version TUI already pins (^1.95.0).
    met: true
    how: main.tsx renders exactly one RouterProvider as the sole tree mounted; package.json pins @tanstack/react-router at ^1.95.0, matching TUI's own range
installed:
  - "@tanstack/react-router"
preserved:
  - the substrate's entry-point mounting pattern -- createRoot targeting #root, wrapped in StrictMode, with the design-system token stylesheet imported before anything renders -- is kept unchanged; only the RouterProvider now sits inside it in place of the direct render
---

## What it is
The empty route tree the scope asks for, one path per proposal screen, each rendering only its own placeholder.
It exists before the AppShell because the AppShell's breadcrumb and sidebar links read from it.

## Notes
None.
