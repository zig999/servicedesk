---
title: Connector configuration single-record edit hook
summary: A new hook that loads one connector configuration by its own identity and tracks dirty/save state the way the routed screen needs.
rationale: Split from the route as its own task because it is a new interface (a single-record query and mutation contract) with exactly one consumer; it is demonstrable on its own terms — phase shape, isDirty computation, re-baseline after save, query invalidation — without any UI existing yet, which the route task cannot be.
objective: A hook exposes one connector configuration, identified by connector, through a loading/load-error/ready phase union, with isDirty computed against the most recently loaded or saved values (including the configuration JSON text) and re-baselined after a successful save.
criteria:
  - The hook issues its own GET for the connector configuration identified by connector, independent of any list screen having already fetched it.
  - The hook exposes a loading | load-error | ready phase union, mirroring use-edit-draft-version-form.ts's shape.
  - In the ready phase, isDirty is true only when at least one form field or the configuration JSON text differs from the values most recently loaded or saved.
  - Returning every field, including configuration, to its most recently loaded or saved value flips isDirty back to false.
  - A successful save re-baselines the originally loaded values, including configuration, to what was just saved, so isDirty is false immediately after a save with no further edits.
  - A successful save invalidates or updates both the "connector-configurations" list query and this hook's own single-record query so neither screen is left reading stale data.
  - The hook reports a load-error phase, with a typed retry action, when the GET fails or the identified connector configuration does not exist.
sources:
  - intake/scope.md
implements:
  - domain/integration/connector-configuration
  - contracts/integration/connector-configuration-registry
---

## What it is

This hook is the data layer the new connector-configuration route depends on: one GET by identity, one dirty/clean tracking scheme covering the configuration JSON field, and one save path that re-baselines and invalidates.
It follows the existing routed-hook convention (use-edit-draft-version-form.ts) rather than the current dialog hook's list-cache-only convention, because a direct navigation or refresh has no list cache to read from.

## Notes

The domain model states connector-configuration's configuration attribute is a string; the sibling backend plan is fixing GET /v1/connectors/{connector} to answer it that way rather than as an object, so this hook's JSON-field criteria are not observably demonstrable against the live backend until that fix ships.
REMAINDER, from the specification — rules/integration/a-connector-configuration-holds-a-well-formed-object states the registry refuses a save whose configuration text is not syntactically valid JSON; this hook's own criteria cover only its loading phases and its successful-save re-baseline/invalidation, never what happens on a refused save. That clause belongs to the connector-configuration detail route task, which owns showing the registry's refusal to the operator.
