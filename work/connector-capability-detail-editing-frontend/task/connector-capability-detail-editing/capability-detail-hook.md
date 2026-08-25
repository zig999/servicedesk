---
title: Capability single-record edit hook
summary: A new hook that loads one capability by its (name, version) identity and tracks dirty/save state the way the routed screen needs.
rationale: >-
  Split from the route task for the same reason as the connector-configuration hook — it is a
  new, independently demonstrable data-and-dirty-tracking interface with one consumer, changing
  for a different reason (data contract) than the screen (layout and interaction).
objective: A hook exposes one capability, identified by name and version together, through a loading/load-error/ready phase union, with isDirty computed against the most recently loaded or saved values (including input_schema and output_schema) and re-baselined after a successful save.
criteria:
  - The hook issues its own GET for the capability identified by both name and version, independent of any list screen having already fetched it.
  - The hook exposes a loading | load-error | ready phase union, mirroring use-edit-draft-version-form.ts's shape.
  - In the ready phase, isDirty is true only when at least one form field, input_schema, or output_schema differs from the values most recently loaded or saved.
  - Returning every field, including input_schema and output_schema, to its most recently loaded or saved value flips isDirty back to false.
  - A successful save re-baselines the originally loaded values, including both JSON schema fields, to what was just saved, so isDirty is false immediately after a save with no further edits.
  - A successful save invalidates or updates both the "capabilities" list query and this hook's own single-record query so neither screen is left reading stale data.
  - The hook reports a load-error phase, with a typed retry action, when the GET fails or the identified (name, version) capability does not exist.
sources:
  - intake/scope.md
implements:
  - domain/integration/capability
  - contracts/integration/capability-registry
---

## What it is

This hook is the data layer the new capability route depends on, covering both input_schema and output_schema for dirty tracking the way use-capability-form.ts already pairs each with its own validity flag.
It reads by (name, version) rather than by name alone, because name alone does not identify a capability uniquely.

## Notes

The sibling backend plan is adding the by-(name, version) capability read route this hook needs; until that route ships, the hook's direct-navigation and refresh criteria are not observably demonstrable against the live backend.
