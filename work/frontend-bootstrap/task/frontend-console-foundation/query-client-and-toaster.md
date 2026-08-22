---
title: Global query client and single toaster mount
summary: A module-level @tanstack/react-query QueryClient (retry:1, a QueryCache-level onError that fires a sonner toast, staleTime left to each query) wrapping the app, and the one sonner Toaster mounted inside the AppShell.
rationale: >-
  The scope asks for react-query as the server-state cache and a single Toaster inside the
  AppShell in the same paragraph; I cut them into one task because the two are the same wiring
  decision -- a background query failure has nowhere to surface without the Toaster mounted, so
  both are falsified by the same criterion (a failing query produces a visible toast) rather
  than by two independent ones. The execution-contract-binder confirmed no candidate governs
  this task: none of its criteria is a domain fact.
objective: The app tree is wrapped in one QueryClientProvider whose QueryClient toasts on a background query failure, and exactly one Toaster renders inside the AppShell.
criteria:
  - A single module-level QueryClient instance is created with retry:1 and no staleTime set on the client itself.
  - The QueryClient's QueryCache declares an onError handler that fires a sonner toast.
  - Exactly one Toaster component is rendered in the app, mounted inside the AppShell.
  - The QueryClientProvider wraps the routed app so every screen shares the same QueryClient instance.
  - The installed @tanstack/react-query version matches TUI's pinned ^5.62.0.
depends_on:
  - task/frontend-console-foundation/app-shell
sources:
  - intake/onda-1-scope.md
---

## What it is
The single QueryClient and single Toaster the scope's STA-01 and AppShell-Toaster lines ask for, shaped to match TUI's documented QueryClient conventions since query-client.ts itself is not importable across the alias.
react-hook-form, zod and sonner become available through this task but are not put into real use until later waves' forms and toasts.

## Notes
None.
