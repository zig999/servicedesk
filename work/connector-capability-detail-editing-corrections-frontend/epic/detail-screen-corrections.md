---
title: Connector-configuration and capability detail-screen corrections
summary: The corrective fixes over connector-capability-detail-editing's already-delivered detail screens — a stricter well-formed-object check on the connector-configuration validity flag, and a confirmation step before both screens' Discard action resets form state.
rationale: The impact set names one specification node; putting fact 1's derivation fix and fact 2's UI-only confirmation task under one epic reflects that both corrections land on the same pair of already-delivered detail screens and share this one epic's claim on the impact set's single node, rather than splitting into a second epic with no node of its own to cover.
sources:
  - intake/scope.md
covers:
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
---

## What it is

The corrective work landing on connector-configuration-detail-ready-view.tsx, capability-detail-ready-view.tsx, and use-connector-configuration-detail.ts, as found by /review-change over the closed connector-capability-detail-editing initiative.
One task tightens the configurationValid derivation so a syntactically valid non-object JSON value no longer reads as valid, closing a gap against the rule this epic covers.
One task inserts a confirmation Dialog before Discard resets form state on both detail screens, reusing the app's one existing confirmation-dialog precedent.

## Notes

None.
