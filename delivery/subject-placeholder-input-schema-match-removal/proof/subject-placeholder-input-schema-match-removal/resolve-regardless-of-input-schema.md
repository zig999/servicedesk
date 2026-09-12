---
target: backend
title: Subject placeholder resolution proof — resolves regardless of input_schema match
summary: Proves outcomeFor() resolves any candidate name to ${subject:<name>} whenever at least one capability
  is registered for the connector, refuses only with no-capability-registered when none is, and never
  produces the retired no-matching-input-schema-property reason — across the resolver's own unit tests
  and the two pre-existing spec files the retired reason also reached.
implementation: sha256:91d7231affc8dc580eea7c8eb856fd92e4522d203990c901db55c220c0b264df
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/resolve-regardless-of-input-schema-suite
tests:
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: names every parameter and request-body field name unresolved with no-capability-registered when
    no capability is registered at all
  proves: Criterion 3 — with no capability registered at all, every candidate name (a query parameter,
    a header parameter and a request-body field, one representative each) is refused with reason no-capability-registered,
    never resolved.
  fails_when: Any of the three names resolves to a ${subject:...} placeholder, or is refused with a reason
    other than no-capability-registered, when the capabilities reader returns an empty list.
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: names every name unresolved with no-capability-registered when only a capability naming a different
    connector is registered
  proves: Criterion 3's connector-scoping boundary — a capability registered for some other connector
    does not count toward 'at least one capability is currently registered' for the connector the draft
    is generated for.
  fails_when: order_id resolves to a placeholder, or is refused with a reason other than no-capability-registered,
    when the only registered capability names a different connector.
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: generates no ${subject:...} placeholder text anywhere in the placement when no capability is registered
  proves: Criterion 3's negative half — no position of the placement (path, query, headers or body) ever
    embeds subject placeholder text when no capability is registered.
  fails_when: Any value in the returned placement contains the substring '${subject:' when the capabilities
    reader returns an empty list.
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: resolves customerId as ${subject:customerId} even though the one registered capability declares
    only customer_id, never withholding it for the mismatch
  proves: Criterion 1 — a name absent from the one registered capability's own input schema still resolves
    to ${subject:<name>}, given at least one capability is registered for the connector; and Criterion
    2 — the resolved name is named in no unresolved item at all, so none carries the retired reason no-matching-input-schema-property.
  fails_when: customerId is instead named in the unresolved list under any reason, or placement.query.customerId
    holds the unsubstituted '{customerId}' form rather than '${subject:customerId}'.
  demonstrates: scenarios/integration/a-mismatched-parameter-name-resolves-regardless
- file: src/__tests__/unit/connector-registry/subject-placeholder-resolution.spec.ts
  name: names a name occupying two positions exactly once in the unresolved list, holding the brace form
    at both of its positions
  proves: domain/integration/connector-configuration-draft-unresolved-item's own shape — one item, exactly
    {name, reason}, never one per occupied position, and the reason value itself is one of the closed
    set.
  fails_when: The unresolved list carries the name more than once, or the item it carries holds a field
    beyond name and reason, or a reason value the closed set does not admit.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-item
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: admits exactly the three vocabulary reasons the specification enumerates, and no other value
  proves: domain/integration/connector-configuration-draft-unresolved-reason's fact that the closed set
    of unresolved reasons holds exactly three values, and criterion 2 of resolve-regardless-of-input-schema.md
    ("no draft names a field ... with reason no-matching-input-schema-property") at the vocabulary level
    — the retired value cannot be named because it no longer exists in the type at all.
  fails_when: CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS ever holds a fourth value, holds the retired
    no-matching-input-schema-property value, or drops one of the three current values.
  demonstrates: domain/integration/connector-configuration-draft-unresolved-reason
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: resolves every parameter and request-body field name to a placeholder once a capability is registered
    for the connector, whatever its own input schema names, while a security scheme that cannot reduce
    to a credential still lists unresolved
  proves: criterion 1 of resolve-regardless-of-input-schema.md ("... still resolves as ${subject:<name>}
    in the draft's configuration, where at least one capability is registered") read literally against
    the draft-generation module's own output, using a capability whose input_schema grants only one of
    the three candidate names; and criterion 2, that none of the three ends up in draft.unresolved with
    the retired reason.
  fails_when: resolved_param, unresolved_param or unresolved_field is left out of the drafted configuration's
    query, headers or body, or is named in draft.unresolved for any reason; or the independently-unresolved
    NotReducible security scheme stops appearing, or appears alongside anything else, in draft.unresolved.
not_applicable:
- edge_case: Concurrent or overlapping calls to resolveSubjectPlaceholders against the same subject.
  why: The function reads no shared mutable state (each call filters the one capabilities snapshot its
    own single readCapabilities() promise returns and computes a fresh Map); nothing here can race, so
    no criterion or node reaches this edge.
- edge_case: A capability count greater than one, all mismatched, distinct from the single-mismatched-capability
    case.
  why: outcomeFor() branches only on registered.length === 0 vs. non-zero; the count once non-zero is
    not a dimension either the rule or the criteria treat differently, so it does not multiply the test
    set — this is also why two tests that varied only this dimension under the retired behavior were removed
    rather than corrected in place.
- edge_case: A new edge case in connector-configuration-draft.spec.ts or connector-configuration-draft-generation.spec.ts
    beyond the stale value each already asserted.
  why: Both edits replace a stale expected value in an existing test against an existing, already-classified
    scenario; the edge-case sweep over the corrected rule is the subject-placeholder-resolution.spec.ts
    invocation's, and is not repeated here.
untested:
- rules/integration/a-connector-configuration-draft-names-subject-placeholders-from-a-registered-capability
  — its fact is a two-branch total function with no third outcome (empty registry refuses, non-empty registry
  resolves regardless of schema content); each branch is separately protected by other tests in this file,
  but no single test decides the rule whole without duplicating assertions those tests already make.
- domain/integration/connector-configuration-draft-unresolved-reason — this file's own subject only ever
  produces one of the three values (no-capability-registered); the other two belong to a different rule
  resolved elsewhere, so no test here could decide the enumeration whole without asserting part of it
  as the whole (the closed-vocabulary test in connector-configuration-draft.spec.ts is what proves the
  enumeration itself).
- scenarios/integration/an-unconfigured-connector-leaves-every-parameter-unresolved — its then-clause
  "the draft is generated, not refused" is a fact about the whole draft-generation flow, decided at the
  level of connector-configuration-draft-generation.spec.ts's other, untouched tests, not by this proof's
  resolution-level tests.
---

## What it is

Rewrites the pre-existing unit tests that encoded the retired input_schema name-match requirement
so they demonstrate the corrected rule instead, across the three spec files it reached.

## Notes

None.
