---
title: Route tree skeleton for the ten proposal screens
summary: An empty @tanstack/react-router route tree with one placeholder route per screen 2.1 through 2.10, with no layout composed yet.
rationale: >-
  The scope describes the AppShell and the router skeleton in the same paragraph; I split the
  route tree into its own task because the AppShell's breadcrumb is documented to render
  through route matches (per the inventory's must_not_duplicate entry for TUI's Breadcrumb), so
  the router is an interface the shell consumes -- a task that changes an interface and its
  consumers in the same breath is two tasks joined by a dependency, not one. The binder
  confirmed no candidate governs this task: it names no domain fact, only route structure and
  a tooling version.
objective: Navigating to any of the ten proposal screens' route paths renders that screen's own placeholder, with no layout composed around it yet.
criteria:
  - Each of the ten screens (2.1 through 2.10) named in the proposal has its own route path defined in the router tree.
  - Visiting each defined route renders that route's own placeholder component, distinct from every other route's placeholder.
  - No route composes a layout beyond its own placeholder content in this task.
  - The router is wired as the single RouterProvider mounted at the app's entry point, using @tanstack/react-router at the version TUI already pins (^1.95.0).
sources:
  - intake/onda-1-scope.md
---

## What it is
The empty route tree the scope asks for, one path per proposal screen, each rendering only its own placeholder.
It exists before the AppShell because the AppShell's breadcrumb and sidebar links read from it.

## Notes
None.
