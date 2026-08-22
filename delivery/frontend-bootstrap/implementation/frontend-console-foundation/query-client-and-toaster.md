---
title: Global QueryClient and single Toaster mount
summary: Adds a module-level @tanstack/react-query QueryClient that toasts on a background query failure through sonner, wraps the routed app in its QueryClientProvider, and mounts the one Toaster inside AppShell.
task: sha256:218924b1ab8ff3ad29d709d3fd1e4ba01f2c2061b0d2380fdd2e14c1df6c5b0c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
run: run/frontend-console-foundation-onda-1-full-suite-2
files:
  - path: src/services/query-client.ts
    effect: >-
      exports a single module-level queryClient (@tanstack/react-query QueryClient) built with a
      QueryCache whose onError calls sonner's toast.error with the thrown error's message (or a
      fixed fallback for a non-Error thrown value), and defaultOptions.queries.retry set to 1 with
      no staleTime set anywhere on the client
  - path: src/shared/components/app-shell.tsx
    effect: >-
      imports sonner's Toaster and renders it once, as a sibling of AppShell's own layout div
      inside a Fragment, so exactly one Toaster mounts for every routed screen without being nested
      inside the shell's flex layout
  - path: src/main.tsx
    effect: >-
      imports the queryClient and QueryClientProvider and wraps the existing RouterProvider in
      QueryClientProvider inside StrictMode, so every routed screen shares the one QueryClient
      instance
  - path: package.json
    effect: declares "@tanstack/react-query" (^5.62.0) and "sonner" (^1.7.1) under dependencies, matching TUI's own pins for both
criteria:
  - criterion: A single module-level QueryClient instance is created with retry:1 and no staleTime set on the client itself.
    met: true
    how: 'src/services/query-client.ts declares `export const queryClient = new QueryClient({...})` once at module scope, with `defaultOptions.queries.retry: 1` and no `staleTime` key anywhere in the client''s own config'
  - criterion: The QueryClient's QueryCache declares an onError handler that fires a sonner toast.
    met: true
    how: "the same module's `queryCache: new QueryCache({ onError: (error) => { toast.error(...) } })` calls sonner's toast.error for every query failure the cache observes"
  - criterion: Exactly one Toaster component is rendered in the app, mounted inside the AppShell.
    met: true
    how: src/shared/components/app-shell.tsx renders a Toaster once, inside AppShell's own returned tree (as a sibling of the shell's layout div via a Fragment); no other file in src/ imports or renders a Toaster
  - criterion: The QueryClientProvider wraps the routed app so every screen shares the same QueryClient instance.
    met: true
    how: >-
      src/main.tsx wraps the existing RouterProvider in QueryClientProvider, importing the same
      queryClient singleton from src/services/query-client.ts, so every route rendered through that
      one router sees the same instance
  - criterion: The installed @tanstack/react-query version matches TUI's pinned ^5.62.0.
    met: true
    how: 'package.json now declares "@tanstack/react-query": "^5.62.0" under dependencies, the exact range TUI''s own package.json pins'
inferences:
  - inferred: the toast fallback text for a non-Error thrown value is English ("Something went wrong while loading data.") rather than TUI's own Portuguese fallback string.
    from: >-
      TUI's shared/lib/query-client.ts is vendored, read-only material that states no fact for this
      project, and this app's own delivered UI strings are English (e.g. app-shell.tsx's "No auth
      in this build"), so the wording follows this app's own convention rather than the vendored
      file's language
  - inferred: both @tanstack/react-query and sonner are declared under package.json's dependencies rather than devDependencies.
    from: >-
      TUI's own package.json places both under dependencies (they are runtime libraries the
      rendered app needs, not build-time tooling), and this app's existing manifest already places
      its other runtime UI libraries (@tanstack/react-router, clsx, tailwind-merge) the same way
installed:
  - "@tanstack/react-query"
  - sonner
preserved:
  - >-
    AppShell's existing sidebar/topbar/Outlet layout and DOM shape -- the layout div its own proof
    queries against (getByRole("navigation", {name: "Primary"}), getByRole("navigation", {name:
    "breadcrumb"}), the sidebar links, the no-auth indicator, the Outlet's routed content) is
    untouched; only a Fragment and a sibling Toaster were added around it
  - >-
    main.tsx's existing StrictMode > RouterProvider render path -- the router skeleton renders
    exactly as before, now one level deeper inside QueryClientProvider, with no change to what
    router itself is or how routes resolve
  - the route placeholders' existing rendering, none of which this task touches
deferred:
  - what: >-
      react-hook-form and zod, which this task's own "What it is" prose names as becoming
      "available through this task" alongside sonner
    why: >-
      none of this task's five stated criteria names either package, and no version pin was given
      for either; adding either without a stated version would be guessing a pin nobody gave, so
      they are left for the wave's forms/toasts tasks that will actually put them to use and can
      state what version they need
---

## What it is
The single QueryClient and single Toaster the scope's STA-01 and AppShell-Toaster lines ask for, shaped to match TUI's documented QueryClient conventions since query-client.ts itself is not importable across the alias.

## Notes
None.
