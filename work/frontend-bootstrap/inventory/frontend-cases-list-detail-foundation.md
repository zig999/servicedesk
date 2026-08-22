---
title: Onda 1 foundation the Cases List and Case Detail screens land on
summary: A router, an AppShell, a typed API client, an error-to-UI-state table, a reusable StatusTable, a QueryClient/Toaster, a telemetry hook and a ConflictBanner already exist under frontend/app/src; Onda 2 replaces two of the router's ten placeholder routes with real, data-driven screens on top of them.
sources:
  - work/frontend-bootstrap/intake/onda-2-scope.md
area:
  - frontend/app/src/routes
  - frontend/app/src/shared/components
  - frontend/app/src/services
  - frontend/app/src/hooks
  - frontend/app/src/main.tsx
  - frontend/app/vite.config.ts
modules:
  - name: route-tree
    path: frontend/app/src/routes/route-tree.tsx
    role: touched
  - name: route-placeholders
    path: frontend/app/src/routes/route-placeholders.tsx
    role: touched
  - name: app-shell
    path: frontend/app/src/shared/components/app-shell.tsx
    role: depends-on
  - name: api-client
    path: frontend/app/src/services/api-client.ts
    role: depends-on
  - name: error-ui-state
    path: frontend/app/src/services/error-ui-state.ts
    role: depends-on
  - name: status-table
    path: frontend/app/src/shared/components/status-table.tsx
    role: depends-on
  - name: query-client
    path: frontend/app/src/services/query-client.ts
    role: adjacent
  - name: use-telemetry
    path: frontend/app/src/hooks/use-telemetry.ts
    role: depends-on
  - name: conflict-banner
    path: frontend/app/src/shared/components/conflict-banner.tsx
    role: adjacent
  - name: vite-config
    path: frontend/app/vite.config.ts
    role: touched
conventions:
  - statement: Every backend call goes through apiFetch(); it is the one place a non-2xx response becomes a typed ApiError, so no component opens a second fetch()/XHR path.
    seen_at: frontend/app/src/services/api-client.ts
  - statement: A route's component never composes its own layout; the root route's own component is AppShell, and every leaf renders inside its Outlet.
    seen_at: frontend/app/src/routes/route-tree.tsx
  - statement: The route tree is flat -- every leaf is a direct, unparented child of the root route, addressed by its full path in one segment string, never through a chain of parent routes.
    seen_at: frontend/app/src/routes/route-tree.tsx
  - statement: A UI error state is resolved once through a central table keyed by ApiError.code, never chosen inline at a call site; an unmapped code falls back to a shared generic-error state rather than throwing.
    seen_at: frontend/app/src/services/error-ui-state.ts
  - statement: A status value always renders its color and its word together, through a { color, label } cell shape; color alone never carries the meaning.
    seen_at: frontend/app/src/shared/components/status-table.tsx
  - statement: A row without an onRowClick handler renders inert; StatusTable's columns and rows are always caller-supplied, never hard-coded.
    seen_at: frontend/app/src/shared/components/status-table.tsx
  - statement: vite.config.ts aliases @tui/ui and @tui/lib to the vendored, read-only frontend/tui submodule and declares no server.proxy entry for any backend path yet.
    seen_at: frontend/app/vite.config.ts
must_not_duplicate:
  - what: The typed fetch wrapper and its ApiError class -- the one place a non-2xx backend response becomes a typed error.
    at: frontend/app/src/services/api-client.ts
  - what: The ApiError-code-to-UI-state lookup table, including its fourteen named error classes and the shared generic-error fallback.
    at: frontend/app/src/services/error-ui-state.ts
  - what: The generic, data-driven table component (columns/rows/onRowClick) a cases list would render through.
    at: frontend/app/src/shared/components/status-table.tsx
  - what: The persistent shell (sidebar, breadcrumb topbar, Outlet, Toaster) every routed screen renders inside.
    at: frontend/app/src/shared/components/app-shell.tsx
  - what: The one module-level QueryClient (retry:1, cache-level onError toast) every routed screen shares.
    at: frontend/app/src/services/query-client.ts
  - what: The eight-event telemetry catalog, including uiStaleConflictDetected, the event this wave's 409 race is expected to fire.
    at: frontend/app/src/hooks/use-telemetry.ts
  - what: The reusable conflict banner composed over TUI's Banner primitive, conveying a conflict through title/message text rather than color.
    at: frontend/app/src/shared/components/conflict-banner.tsx
risks:
  - risk: Replacing CasesListPlaceholder and CaseDetailPlaceholder without changing the route paths themselves is safe for route-tree.tsx's registration, but AppShell's own ROUTE_LABELS table is keyed by these same route ids for breadcrumb text -- a task that renames or reshapes the /cases or /cases/$slug path (rather than only swapping the component) desyncs that table silently.
    consumers:
      - frontend/app/src/shared/components/app-shell.tsx
      - frontend/app/src/shared/components/app-shell.spec.ts
      - frontend/app/src/routes/route-tree.spec.ts
  - risk: apiFetch carries no base URL and vite.config.ts declares no server.proxy; a browser fetch() to the real backend at localhost:3000 is blocked by CORS today (confirmed via curl -i -H Origin against the running backend, no Access-Control-Allow-Origin header) -- the first task in this wave to actually call GET /v1/cases or POST /v1/cases must add a dev proxy (server.proxy for /v1/*) before any real call can succeed in a browser.
    consumers:
      - frontend/app/src/services/api-client.ts
      - frontend/app/vite.config.ts
  - risk: error-ui-state.ts resolves CaseAlreadyHasDraftError to a distinct "case-already-has-draft" UiErrorStateKind, but no code anywhere yet turns that kind into the toast-plus-redirect behavior the proposal describes for the 409 race -- a Case Detail task that assumes the redirect already exists elsewhere will find nothing to reuse.
    consumers:
      - frontend/app/src/services/error-ui-state.ts
      - frontend/app/src/shared/components/app-shell.tsx
---

## What it is
The delivered, reviewed foundation from epic/frontend-console-foundation (onda 1): a flat, code-based TanStack router with ten placeholder routes wired to a shared AppShell, a typed apiFetch/ApiError wrapper around the backend's error envelope, a central ApiError-code-to-UI-state table, a generic data-driven StatusTable, a module-level QueryClient with a cache-level toast handler, an eight-event telemetry hook sinking to console.info, and a ConflictBanner over TUI's Banner primitive.
Onda 2 lands two real screens, Cases List and Case Detail, by replacing the CasesListPlaceholder and CaseDetailPlaceholder components the existing /cases and /cases/$slug routes already point at.
route-tree.tsx's own routes for /cases and /cases/$slug need no path or router-wiring change to host the real screens -- only their component swaps out; the flat, unparented route shape and AppShell's Outlet composition are already what a real screen would render inside.
vite.config.ts today declares plugins and TUI aliases but no server.proxy, and the real backend does not send Access-Control-Allow-Origin, so a browser-side apiFetch call to GET /v1/cases or POST /v1/cases would be blocked by CORS until a dev proxy is added.

## Notes
StatusTable's { color, label } cell convention and its onRowClick contract are exactly the shape the Cases List wireframe (table, color+word state, clickable row navigating to detail) calls for -- no new table primitive is needed.
error-ui-state.ts already names a distinct case-already-has-draft kind for the 409 CaseAlreadyHasDraftError the Case Detail "New draft" flow is expected to hit as an expected race, and useTelemetry already exposes uiStaleConflictDetected for the conflict-banner scenario elsewhere in the proposal, but neither wave built the toast-plus-redirect behavior itself.
None of the ten route components other than the two Onda 2 touches (CasesListPlaceholder, CaseDetailPlaceholder) are in this scope's area; the other eight placeholders and their routes are unaffected and were not walked beyond confirming their existence in route-tree.tsx.
