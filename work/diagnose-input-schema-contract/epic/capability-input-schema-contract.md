---
title: Capability input-schema shape contract
summary: The capability registry's refusal pipeline, extended by the well-formed input-schema
  shape check and its legacy-read posture for capabilities registered before the check
  existed.
sources:
- work/diagnose-input-schema-contract/intake/scope.md
covers:
- domain/integration/capability
- domain/integration/capability-registry
- domain/integration/capability-nature
- rules/integration/a-capability-declares-its-contract
- rules/integration/a-capability-declares-well-formed-schemas
- rules/integration/a-capability-input-schema-holds-a-well-formed-object
- rules/integration/a-capability-is-read-only
- rules/integration/one-capability-answers-one-concept
- contracts/integration/capability-registry
uncovered:
- node: rules/integration/a-capability-declares-its-contract
  why: The IncompleteCapabilityContractError refusal for a missing schema, connector,
    concept or timeout already stands before this increment; this plan adds a further
    shape check that runs once this one already passed, without altering it.
- node: rules/integration/a-capability-declares-well-formed-schemas
  why: The CapabilitySchemaNotWellFormedError refusal for schema text that is not
    syntactically valid JSON already stands; the new shape check applies only once
    this one already passed.
- node: rules/integration/a-capability-is-read-only
  why: The CapabilityNotReadOnlyError refusal is unchanged by this increment.
- node: rules/integration/one-capability-answers-one-concept
  why: The one-capability-per-concept resolution policy is unchanged by this increment.
- node: domain/integration/capability-nature
  why: The read-only/mutating enumeration is unchanged; the new check bears on input_schema
    alone.
rationale: The epic boundary is my own grouping — separating the capability-registration
  side of the contract from the connector-registration side and from the diagnose/case-derivation
  side, so each epic answers to one registration surface's own refusal pipeline. The
  pre-existing capability refusals sit in this epic's covers because they constrain
  the same aggregate the new check joins, but they are marked uncovered because the
  scope states no change to any of them.
---

## What it is
The capability registry's existing registration refusal pipeline.
The one new shape check this scope adds to it: input_schema, once valid JSON, must declare properties as an object and, where present, required as a subset of its keys.
The read posture for a capability registered before this check existed, whose stored input_schema lacks this shape.

## Notes
None.
