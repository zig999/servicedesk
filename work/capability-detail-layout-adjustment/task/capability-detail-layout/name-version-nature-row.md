---
title: Group Name, Version and Nature into one row
summary: CapabilityFormFields renders Name, Version and Nature as three columns of one row instead of
  Nature sitting in its own row below.
rationale: The scope leaves the exact row-container mechanics (a three-column grid vs. some other row
  wrapper) to the implementer's own conventions; the criteria below state only the falsifiable outcome
  the scope asked for, not that specific markup choice. The execution-contract-binder confirmed, on a
  fresh reread of domain/integration/capability and domain/integration/capability-nature, that neither
  node states or implies anything about screen layout or field grouping, so this task implements no specification
  node -- it only relocates an already-displayed field.
sources:
- work/capability-detail-layout-adjustment/intake/scope.md
objective: Name, Version and Nature render together in a single three-column row in CapabilityFormFields,
  rather than Nature sitting in its own separate row below the Name/Version row.
criteria:
- CapabilityFormFields wraps the Name, Version and Nature FormField elements in one shared row container
  instead of Nature's current standalone FormField block rendered below the Name/Version row.
- Nature keeps its existing selectable values and its current selected value for any given capability;
  only its screen position changes.
- Name and Version keep their existing values and validation behavior unchanged by the regrouping.
- The existing capability-detail-screen.spec.ts suite, which locates every field by screen.getByLabelText,
  passes without modification to its assertions.
---

## What it is

One task of the capability-detail-layout-adjustment epic: a purely presentational regrouping of three already-displayed fields into one row.

## Notes

None.
