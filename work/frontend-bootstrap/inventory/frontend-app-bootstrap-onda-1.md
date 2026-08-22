---
title: Frontend app substrate and TUI catalog before Onda 1's foundation
summary: The target root builds, lints and renders one TUI component through the @tui/ui alias, but has no router, query layer, app shell, sidebar/nav, or screen; TUI's own catalog already ships the table, alert/banner and breadcrumb primitives this wave would otherwise rebuild, and the backend's error envelope and status map are the one contract the new API client must match.
area:
  - frontend/app
  - frontend/tui/frontend/src/shared/components/ui
  - frontend/tui/frontend/src/shared/lib
  - src/src/errors
  - src/src/http
modules:
  - name: app-root
    path: frontend/app/src/app.tsx
    role: touched
  - name: app-entry
    path: frontend/app/src/main.tsx
    role: touched
  - name: vite-config
    path: frontend/app/vite.config.ts
    role: touched
  - name: tsconfig
    path: frontend/app/tsconfig.json
    role: touched
  - name: package-manifest
    path: frontend/app/package.json
    role: touched
  - name: tui-ui-catalog
    path: frontend/tui/frontend/src/shared/components/ui
    role: depends-on
  - name: tui-shared-lib
    path: frontend/tui/frontend/src/shared/lib
    role: depends-on
  - name: status-map
    path: src/src/errors/status-map.ts
    role: depends-on
  - name: error-handler-middleware
    path: src/src/http/error-handler.middleware.ts
    role: depends-on
conventions:
  - statement: "@tui/ui/* and @tui/lib/* are wired as bundler aliases (vite.config.ts) mirrored one-for-one in tsconfig.json's paths, plus a narrow extra alias for TUI's own internal `@/shared/lib/cn` specifier -- a new alias for this app's own future src/ must not claim the bare `@` prefix TUI's vendored source already uses that way."
    seen_at: frontend/app/vite.config.ts
  - statement: "Every catalog component takes `className` merged through a single `cn()` (clsx + extendTailwindMerge), never string concatenation; `ref` is a plain prop, never forwardRef."
    seen_at: frontend/tui/frontend/src/shared/lib/cn.ts
  - statement: "A component with two or more visual variants uses `cva()` defined at module scope (never inside the render body); a single-variant component skips CVA entirely."
    seen_at: frontend/tui/frontend/src/shared/components/ui/alert/alert.tsx
  - statement: "The global QueryClient is a single module-level instance with retry:1 and a QueryCache-level onError that fires a sonner toast; staleTime is set per query (stable data 5min, volatile data 0), never on the client."
    seen_at: frontend/tui/frontend/src/shared/lib/query-client.ts
  - statement: "Every domain error the HTTP surface can raise maps to a transport status in exactly one table, keyed by error class; an error class the table does not name falls through to a fixed 500 envelope `{error:{code:'INTERNAL_ERROR', message:'an unexpected error occurred'}}` with no per-class code."
    seen_at: src/src/errors/status-map.ts
  - statement: "A mapped domain error's envelope carries the error's own class name as `code` (e.g. `CaseNotFoundError`) and its `context` object as `details` when present -- `code` is not a fixed enum, it is the constructor name."
    seen_at: src/src/http/error-handler.middleware.ts
must_not_duplicate:
  - what: "Compound Table (Table/TableHeader/TableBody/TableRow/TableHead/TableCell), thin and dependency-free, re-themed to TUI tokens -- the base for the reusable clickable-row/status table the scope asks for"
    at: frontend/tui/frontend/src/shared/components/ui/table/table.tsx
  - what: "Alert (info/success/warning/destructive variants, icon + title + dismiss, role=alert|status by variant) -- the primitive a conflict banner or an inline error state should compose over rather than reimplement"
    at: frontend/tui/frontend/src/shared/components/ui/alert/alert.tsx
  - what: "Banner (frame=none|notched, accent, titleLevel 1-3, action/logo slots) -- available for the seção 2.3 reusable conflict banner, distinct from Alert's inline role"
    at: frontend/tui/frontend/src/shared/components/ui/banner/banner.tsx
  - what: "Breadcrumb (ordered list, current-page span, optional Link items) -- the primitive the AppShell topbar's breadcrumb should render through, not re-derive from route matches by hand"
    at: frontend/tui/frontend/src/shared/components/ui/breadcrumb/breadcrumb.tsx
  - what: "cn() built from a single extendTailwindMerge instance registering this catalog's custom token groups -- any new class-merge helper in the app must reuse this instance (already aliased in) rather than instantiate a second tailwind-merge config that resolves conflicts differently"
    at: frontend/tui/frontend/src/shared/lib/cn.ts
  - what: "The global QueryClient shape (retry:1, QueryCache-level onError toasting, per-query staleTime) documented in TUI's CLAUDE.md Data Layer section -- the query-client.ts file itself lives in the vendored tree and is not importable across the alias, so the app's own client must replicate this shape rather than invent a different retry/error policy"
    at: frontend/tui/frontend/src/shared/lib/query-client.ts
  - what: "statusForError(), the one table resolving a thrown domain error to its transport status -- the new frontend error→UI-state table must key off the same ten error class names (and the same fallback-to-500 boundary) rather than re-deriving its own status list"
    at: src/src/errors/status-map.ts
risks:
  - risk: "No AppShell, router or nav component exists yet in the app or in TUI's catalog (no sidebar/nav primitive was found among the 20 published ui/ components) -- the sidebar is new construction, not reuse, and a wrong shape here is inherited by every screen from Onda 2 onward."
    consumers:
      - frontend/app/src/app.tsx
      - work/case-authoring-console (existing epic that will build screens on top of this shell)
  - risk: "The API client is written against a backend contract (envelope shape, ten mapped error classes, four unmapped classes falling to a generic 500) that this frontend has never called at runtime -- any drift between src/src/errors/status-map.ts and what the running server actually returns (e.g. a future eleventh error class, or a context shape change) is invisible until a real request is made, since Onda 1 ships routes as placeholders with no live call."
    consumers:
      - frontend/app (the typed ApiError and the error→UI-state table this task builds)
      - work/case-authoring-console (the epic that will make the first real calls against this client)
  - risk: "@tanstack/react-query and @tanstack/react-router are pinned in TUI's own package.json (query v5.62, router v1.95) but frontend/app/package.json declares neither yet -- installing a different major/minor in this app produces two divergent versions of the same libraries across the two packages with no workspace to catch the mismatch."
    consumers:
      - frontend/app/package.json
      - frontend/tui/frontend/package.json
  - risk: "TUI's shared/lib and shared/components/ui are vendored, read-only source reached only through the alias; a task that edits anything under frontend/tui/frontend to fit this app's shell edits a tree this initiative does not own."
    consumers:
      - frontend/tui/frontend/src/shared
sources:
  - work/frontend-bootstrap/intake/onda-1-scope.md
---

## What it is
The delivered substrate at `frontend/app` (package.json, tsconfig, vite, eslint, stylelint, playwright configs) that installs, builds, lints and renders exactly one TUI component through the `@tui/ui/*` alias, with no router, no query layer, no app shell and no real screen yet.
TUI's own catalog at `frontend/tui/frontend/src/shared/components/ui` already ships table, alert, banner and breadcrumb primitives that cover most of what Onda 1's AppShell, error banner and reusable table need, plus a `cn()` helper and a documented QueryClient shape in `shared/lib`.
The backend's error contract — a `{error:{code,message,details?}}` envelope where `code` is the thrown error's class name, resolved through one status-map table with a fixed 500 fallback for four unmapped classes — is the one external contract the new typed API client and its error→UI-state table must match.

## Notes
No sidebar/shell/nav component exists anywhere in TUI's published catalog, so the AppShell's sidebar and topbar composition is new construction built over Breadcrumb, not a duplication risk to flag against an existing primitive.
TUI's own App.tsx is a minimal Storybook-era placeholder and does not itself demonstrate a working router or query-client wiring in a running app, despite the packages being present in TUI's package.json — the router/query conventions for this wave come from TUI's CLAUDE.md prose and the query-client.ts/cn.ts source, not from a working example screen.
The four error classes the status map does not name (`CaseHoldsNoDraftError`, `ConceptNotInGlossaryError`, `ConceptRefusesSubjectTypeError`, `CaseNotValidError`) arrive at the frontend as an indistinguishable generic 500 `INTERNAL_ERROR`, not as their own class name — the scope's fallback row for these four is the only correct treatment available given today's backend.
