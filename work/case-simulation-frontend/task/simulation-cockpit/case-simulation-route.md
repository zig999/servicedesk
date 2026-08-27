---
title: Simulation route and header
summary: Registers the new route and renders the header identifying the version, its state, and its links.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: The route /cases/$slug/versions/$version/simulate exists, is labeled in the breadcrumb, and renders a header showing the version's identity, its state, its when_to_use, and links to the existing "Edit version" and "Manifest" screens — for a version in either draft or released state.
criteria:
  - route-tree.tsx declares the new leaf route and it resolves for both a draft and a released version's slug/version pair.
  - ROUTE_LABELS carries an entry for the new route so the breadcrumb shows a readable label rather than falling back to the raw pathname.
  - "The header shows the version's own state as a pill using the app's existing convention (draft = bg-warning, released = bg-success)."
  - The header shows the version's when_to_use text.
  - The header's "Edit version" link targets the version screen directly when the version is draft, and targets creating a draft from this version (/cases/$slug/versions/new?sourceVersion=<n>) when the version is released.
  - The header's "Manifest" link targets the existing manifest screen for that version.
  - A "Simulate case" control is present in the header, and its enabled/disabled state is driven by a prop the header itself does not compute.
reference:
  - layout/simulation-screen.md
implements:
  - contracts/investigation/case-simulation
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
---

## What it is

The header region of the layout's wireframe, and the route/label registration every new leaf route in this app needs.

## Notes

Criterion "the header shows its declared deadline" was dropped on composition: the binder found no candidate node states a "declared deadline" concept for simulation — `rules/investigation/an-answer-arrives-within-the-declared-deadline` states one for `diagnose` specifically (twenty seconds), outside this task's candidate set and outside this epic's covers, and `/analyse` deliberately did not extend that rule to simulation (see the case-simulation-backend plan's own report). Showing a deadline the specification never states for this operation would be a fact this source has no home for; the header shows identity, state, when_to_use and the links only.
Decision, beyond the covers — stand: `rules/investigation/an-answer-arrives-within-the-declared-deadline` is named only to explain a dropped criterion, never as a fact this task implements; nothing here claims the header shows or enforces that rule's deadline.
