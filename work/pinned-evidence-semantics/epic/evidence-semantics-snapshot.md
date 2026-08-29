---
title: Evidence snapshots concept and field semantics at collection
summary: Evidence records its own snapshot of the producing capability's field semantics
  and the collected concept's own description, exactly as they stood at the moment
  of collection, durable across the relational investigation store.
rationale: Split out as the producer side of the pinned-semantics change — evidence
  gains new attributes and evidence-collection reads them once, at collection — separate
  from how judgment later consumes them, because collection has its own reason to
  change (what gets captured) distinct from judgment's (what never gets re-read).
covers:
- domain/investigation/field-semantics
- domain/investigation/evidence
- domain/integration/capability
- rules/integration/evidence-arrives-in-the-glossary-vocabulary
- scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
- scenarios/investigation/a-collection-timeout-degrades-to-no-data
- scenarios/investigation/a-simulation-never-enters-the-cache
- scenarios/integration/an-optional-attribute-absent-degrades-its-observation
- rules/investigation/collection-runs-in-the-requester-scope
- rules/investigation/one-evidence-per-collected-concept
- rules/investigation/no-stage-aborts-on-its-deadline
- rules/integration/an-http-connector-configuration-declares-its-call
- rules/integration/an-unresolvable-observation-ends-unavailable
- rules/integration/an-unclassified-status-ends-unavailable
uncovered:
- node: domain/integration/capability
  why: The capability aggregate's own shape is unchanged; this scope only reads its
    already-declared output_schema, structurally, the same way capability-input-schema-shape.ts
    already reads input_schema.
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  why: Observation normalization to the glossary's vocabulary is unaffected by evidence
    gaining two further snapshotted attributes.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  why: The collection-budget race is untouched; no task changes timing or racing behavior.
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  why: Timeout-to-no-data degradation is unaffected by evidence gaining fields and
    concept_description.
- node: scenarios/investigation/a-simulation-never-enters-the-cache
  why: Cache admission by evidence-result is unrelated to the two new snapshotted
    attributes.
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  why: Connector placeholder resolution is unaffected by this scope.
- node: rules/investigation/collection-runs-in-the-requester-scope
  why: Authorization scope during collection is untouched by adding a semantics snapshot.
- node: rules/investigation/one-evidence-per-collected-concept
  why: The one-evidence-per-concept invariant is a structural fact of the collection
    plan, unaffected by widening what each evidence item carries.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  why: Deadline-overrun handling for collection is unaffected by the new attributes.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  why: Connector call assembly is unrelated to the concept/field semantics snapshot.
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  why: The unavailable ending's own causes are unaffected by this scope.
- node: rules/integration/an-unclassified-status-ends-unavailable
  why: Unclassified-status handling is unaffected by this scope.
sources:
- intake/scope.md
---

## What it is
Evidence gains fields and concept_description, captured once at the moment a concept is collected.
The relational investigation store persists and reads back that snapshot, additively over what it already stores.

## Notes
None.
