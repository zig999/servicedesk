---
title: Subject placeholder resolution stops requiring an input_schema name match
summary: 'Bring subject-placeholder-resolution.ts back into conformance with the revised
  specification: a request field resolves as ${subject:<name>} wherever a capability
  is registered for the connector, regardless of input_schema match.'
covers:
- domain/integration/connector-configuration-draft-unresolved-item
- domain/integration/connector-configuration-draft-unresolved-reason
- rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
- rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
- scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved
- scenarios/integration/a-mismatched-parameter-name-resolves-regardless
uncovered:
- node: rules/integration/a-connector-configuration-draft-places-each-part-where-the-call-carries-it
  why: The binder found no clause of this task's criteria reaching where a resolved part sits in the drafted call (address, query, header, cookie or body position); that is governed by the already-closed connector-configuration-helper draft-generation tasks, not by this correction, which decides only whether a name resolves.
sources:
- intake/scope.md
---

## What it is

The trace already binds `src/src/connector-registry/subject-placeholder-resolution.ts` to these
five nodes; this epic claims exactly that set to correct the one file, re-judging nothing else.

## Notes

None.
