---
title: Confirm before Discard resets form state on both detail screens
summary: Both connector-configuration-detail-ready-view.tsx and capability-detail-ready-view.tsx require an explicit confirm step, via a reused @tui/ui/dialog confirmation, before Discard resets form state.
rationale: >-
  Discard is pure client-side form-state UI — it resets react-hook-form and JSON-schema-field
  state to the last loaded-or-saved values and calls no registry operation — so no
  specification node governs it. The binder confirmed this by a full specification-root
  search, not only the epic's one candidate, and returned a note classed unstated framed as
  "a Discard control does not itself require a confirmation step before the reset takes
  effect." That framing was not sent to a fact-decider: it is not a business fact this
  initiative is deciding into the domain (the requirement to add a confirmation step is a
  standard-conformance/UX-safety correction, decided directly with the human during this same
  planning session, not a fact about what the registry, a capability or a connector
  configuration is or does), and deciding it into the specification would record UI/interaction
  detail the framework holds out of the specification's five classes ("persistence, UI, stack,
  performance" per this project's own CLAUDE.md). This task therefore implements no
  specification node.
sources:
  - intake/scope.md
objective: Both the connector-configuration-detail and capability-detail ready-views require an explicit confirm step, via a Dialog composed from @tui/ui/dialog's existing primitives, before Discard resets the ready-view's form state.
criteria:
  - "Clicking Discard on connector-configuration-detail-ready-view.tsx opens a confirmation Dialog rather than calling state.onDiscard immediately."
  - "Confirming that dialog calls state.onDiscard, resetting the connector-configuration form to its last loaded-or-saved values."
  - "Cancelling or closing that dialog leaves the connector-configuration form's unsaved edits intact and does not call state.onDiscard."
  - "Clicking Discard on capability-detail-ready-view.tsx opens a confirmation Dialog rather than calling state.onDiscard immediately."
  - "Confirming that dialog calls state.onDiscard, resetting the capability form to its last loaded-or-saved values."
  - "Cancelling or closing that dialog leaves the capability form's unsaved edits intact and does not call state.onDiscard."
  - "Both dialogs are composed from @tui/ui/dialog's existing primitives with two explicit buttons — one to discard, one to continue editing — matching the Release dialog's plain two-button shape in case-version-editor-ready-view.tsx rather than the typed-slug Discard dialog's heavier shape."
  - "connector-configuration-detail-screen-discard.spec.ts and capability-detail-screen-discard.spec.ts no longer assert the removed one-click-no-confirmation behavior."
---

## What it is

The confirmation Dialog inserted between the Discard button's click and the call to state.onDiscard, on both connector-configuration-detail-ready-view.tsx and capability-detail-ready-view.tsx.
The dialog reuses @tui/ui/dialog's primitives already composed for case-version-editor-ready-view.tsx's Release dialog, not a new shared wrapper component.

## Notes

None.
