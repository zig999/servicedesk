---
target: backend
title: Drafted statusMap classification and status-reading disclosure -- proof
summary: Seven new unit tests over generateConnectorConfigurationDraft prove the statusMap's ok/denied/unavailable
  classification at its boundaries, its exclusion of default- and range-keyed responses, the one-reading-per-entry
  pairing, and the declared_as disclosure rule; one criterion was already fully proved by the implementation's
  own updated pre-existing test.
implementation: sha256:4ac11a31d04be6773eeac3bb553ce70d7c1fc834faab10b1d42ef6b700858062
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-drafted-status-map-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: always states a statusMap key drafted from the operation's declared responses -- empty when it
    declares none -- never states a responseMap key, and pairs an empty status_readings list with that
    empty statusMap
  proves: The drafted configuration object holds a statusMap key for every operation, including one declaring
    no responses, where it holds an empty object (pre-existing test, updated by the implementation round).
  fails_when: The drafted configuration omits the statusMap key entirely, or states a non-empty one, when
    the operation declares no responses.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts the ok ending for a status at each end of the 200-through-299 range
  proves: A numeric status from 200 through 299 is drafted with ending ok.
  fails_when: The status 200 or the status 299 is drafted with an ending other than ok.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts the denied ending for exactly the statuses 401, 403 and 407
  proves: The statuses 401, 403 and 407 are drafted with ending denied.
  fails_when: Any of the three declared statuses 401, 403 or 407 is drafted with an ending other than
    denied.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts the unavailable ending for a status immediately outside each end of the 200-through-299
    range
  proves: A numeric status outside 200 through 299 and other than 401, 403 and 407 is drafted with ending
    unavailable.
  fails_when: The status 199 or the status 300 is drafted with ending ok (or anything other than unavailable).
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: drafts the unavailable ending, never timeout, for the statuses HTTP itself names as a timeout
  proves: No declared status is drafted with ending timeout.
  fails_when: The status 408 or the status 504 is drafted with ending timeout, or with any ending other
    than unavailable.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: produces no statusMap entry and no status reading for a default-keyed or a range-keyed response
  proves: A response keyed default produces no statusMap entry, and a response keyed by a range such as
    2XX produces no statusMap entry.
  fails_when: The statusMap or the status_readings list carries an entry keyed default or keyed 5XX.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries exactly one status reading per drafted statusMap entry, each holding that entry's own
    status and ending
  proves: The draft carries exactly one status reading per drafted statusMap entry, holding that entry's
    status and ending.
  fails_when: status_readings holds a different number of entries than statusMap declares keys, or any
    entry's status or ending does not match the statusMap entry it is paired with.
- file: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  name: carries the document's own description as declared_as on a status reading, and omits declared_as
    entirely where the document declares no description
  proves: A status reading carries the description the document declares for that response, and carries
    none where the document declares none.
  fails_when: The reading for the status whose response declares a description omits declared_as or states
    a different value, or the reading for the status whose response declares none carries a declared_as
    key at all.
  demonstrates: domain/integration/connector-configuration-draft-status-reading
not_applicable:
- edge_case: Absent or empty request input at the validation boundary.
  why: This task's obligations are all about classifying an already-read set of declared responses; input
    validation is a different layer's concern.
- edge_case: Two operations reading the same document concurrently, or a slow/failing dependency mid-classification.
  why: draftedStatusMap, statusEnding and draftedStatusReadings are pure functions with no shared mutable
    state and no I/O of their own.
- edge_case: A duplicate responses key.
  why: A JS/JSON object cannot hold two properties of the same name; no real fetch could deliver this
    case.
- edge_case: An operation attempted against state that forbids it.
  why: There is no state machine in this classification -- the same document always classifies the same
    way.
untested:
- domain/integration/connector-configuration-draft -- its fact spans the whole draft; this task encodes
  only the statusMap and status_readings parts, the rest being sibling tasks' REMAINDER. No test in this
  proof decides the node's fact whole.
- rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  -- the rule's own statement excludes a purely numeric responses key outside 100-599 from the statusMap,
  a clause the task's Notes flag as UNDERDETERMINED and no criterion of this task states; no test here
  decides that clause.
- rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  -- the task's own REMAINDER note confines this task to the rule's response-$ref-and-description clause
  alone, and even that reaches no criterion of this task (UNDERDETERMINED).
- 'UNDERDETERMINED entry -- a purely numeric responses key outside 100-599 producing no statusMap entry:
  the binder''s note names no implementation to test against, so no test was written.'
- 'UNDERDETERMINED entry -- a response declared as a $ref to a reusable components/responses object: the
  binder''s note names no implementation to test against, so no test was written.'
---

## What it is
Seven new tests over generateConnectorConfigurationDraft proving the statusMap's classification (ok/denied/unavailable, at range boundaries and the three denied statuses), its exclusion of default/range keys, the one-reading-per-entry pairing, and the declared_as disclosure rule.

## Notes
None.
