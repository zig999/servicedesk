---
title: Capability schema draft generation from one OpenAPI operation
summary: The derivation that turns one operation of a fetched OpenAPI 3.x document into a capability schema draft — an input_schema, an output_schema and the unresolved list naming what could not honestly be resolved.
rationale: The scope names the derivation and the endpoint as one backend half without cutting them apart; I cut them apart because the derivation is a pure reading of an already-parsed operation and the endpoint is an HTTP seam, and the two change for different reasons — a change to how a type is read from a schema is not a change to how a request is accepted.
sources:
- intake/scope.md
covers:
- domain/integration/capability-schema-draft
- domain/integration/capability-schema-draft-unresolved-item
- domain/integration/capability-schema-draft-unresolved-reason
- rules/integration/a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields
- rules/integration/a-capability-schema-drafts-output-schema-is-read-from-the-chosen-operations-success-responses
- rules/integration/a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order
- rules/integration/a-part-both-unreducible-and-name-claimed-stands-in-unresolved-under-each-reason
- rules/integration/a-name-whose-first-claimant-is-unreducible-drafts-no-input-schema-entry
- rules/integration/a-drafted-capability-schema-requiring-no-name-declares-no-required-array
- scenarios/integration/a-capability-schema-drafts-input-schema-reads-required-path-parameters
- scenarios/integration/a-capability-schema-drafts-output-schema-reads-the-lowest-success-status
- scenarios/integration/a-schema-drafts-colliding-parameter-names-favor-declared-order
---

## What it is

The reading that takes one operation of a parsed OpenAPI 3.x document and produces a capability schema draft's input_schema, output_schema and unresolved list.
It reuses the existing parameter, request-body and success-response readings rather than restating them.
It is pure derivation: it fetches nothing, publishes no route and writes nothing.

## Notes

The draft's two schemas are emitted as JSON text, matching how a capability's own schemas are stored and how the sibling draft already emits its configuration.
The unresolved reason vocabulary is closed at two values, and each value is produced by a different task in this epic.
Several specification nodes this epic's own tasks name as reused rather than redelivered — the path-item/$ref and request-body readings, the success-response envelope reading, the security-scheme-collision precedent, the capability schema shape checks, and the sibling connector-configuration-draft/openapi-document-operations elements and their own operations-listing read — are not claimed by this epic's `covers` at all: they already stand delivered in src/src/connector-registry/openapi-operation-reader.ts and src/src/capability-registry/capability-input-schema-shape.ts, and this plan reuses that implementation rather than re-judging or redelivering the rules that already govern it.
