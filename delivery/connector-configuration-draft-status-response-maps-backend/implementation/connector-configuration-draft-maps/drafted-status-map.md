---
target: backend
title: Drafted statusMap and its status readings
summary: The generator now always states a statusMap key built from the operation's declared numeric-status
  responses, paired one-for-one with status_readings, and three pre-existing tests were updated to match
  this replacement of the revoked never-drafted rule.
task: sha256:0514163bf6e66f4e239437f146c4e6256920e57236b3eb5255dd9284b9b6503d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-drafted-status-map-build-2
files:
- path: src/connector-registry/connector-configuration-draft-generation.ts
  effect: draftedConfigurationText now always emits a statusMap key (built by draftedStatusMap from the
    operation's numeric-status responses, empty object when none are declared) after address/query/headers/body,
    and generateConnectorConfigurationDraft's return now carries status_readings built by draftedStatusReadings,
    one entry per statusMap entry, each holding status and ending and, where the document declares one,
    declared_as; statusEnding classifies 401/403/407 as denied, 200-299 as ok, and everything else numeric
    as unavailable; statusResponses filters the reading's responses to those OpenApiOperationReading marked
    kind 'status'.
- path: src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  effect: Replaced the single test asserting the revoked never-states-a-statusMap behavior with one asserting
    the new behavior -- the drafted configuration always carries a statusMap key (empty object here),
    draft.status_readings is the paired empty array, and responseMap is still never stated; every other
    test in the file is unchanged.
- path: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  effect: Mechanically updated the two expected configuration JSON strings (the no-parameters/no-security
    200 case and the method_mismatch 200 case) to include ,"statusMap":{} after address, matching draftedConfigurationText's
    actual key order for these fixtures; no other assertion in the file was touched.
criteria:
- criterion: The drafted configuration object holds a statusMap key for every operation, including one
    declaring no responses, where it holds an empty object.
  met: true
  how: draftedConfigurationText unconditionally sets statusMap in the returned object literal, and draftedStatusMap
    returns {} when statusResponses(responses) is empty.
- criterion: A numeric status from 200 through 299 is drafted with ending ok.
  met: true
  how: statusEnding returns 'ok' when the status is not in DENIED_STATUSES and Number(status) falls within
    200-299 inclusive.
- criterion: The statuses 401, 403 and 407 are drafted with ending denied.
  met: true
  how: DENIED_STATUSES is the fixed set {'401','403','407'}; statusEnding checks membership before the
    numeric range check, returning 'denied'.
- criterion: A numeric status outside 200 through 299 and other than 401, 403 and 407 is drafted with
    ending unavailable.
  met: true
  how: statusEnding's final branch returns 'unavailable' for any status that is neither a denied status
    nor within the ok range.
- criterion: No declared status is drafted with ending timeout.
  met: true
  how: statusEnding's three branches (denied, ok, unavailable) never produce 'timeout'.
- criterion: A response keyed default produces no statusMap entry.
  met: true
  how: statusResponses filters responses to response.kind === 'status'; a default-keyed response is classified
    under a different kind by the openapi-operation-reader task and is excluded.
- criterion: A response keyed by a range such as 2XX produces no statusMap entry.
  met: true
  how: Same statusResponses filter -- the reader classifies a range key under a kind other than 'status'.
- criterion: The draft carries exactly one status reading per drafted statusMap entry, holding that entry's
    status and ending.
  met: true
  how: draftedStatusReadings maps the same filtered statusResponses(responses) list draftedStatusMap consumes,
    through statusReadingOf, one reading per status response.
- criterion: A status reading carries the description the document declares for that response, and carries
    none where the document declares none.
  met: true
  how: statusReadingOf conditionally spreads declared_as only when response.description is not undefined.
nodes:
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: The draft's shape now includes the always-present statusMap (in configuration) and status_readings
    fields this domain node describes as part of the draft.
- node: domain/integration/connector-configuration-draft-status-reading
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: ConnectorConfigurationDraftStatusReading's status/ending/declared_as shape is populated by statusReadingOf
    exactly per this node's description.
- node: rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  - src/__tests__/unit/connector-registry/connector-configuration-draft-generation.spec.ts
  - src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  how: draftedStatusMap builds the statusMap from the operation's declared numeric-status responses via
    statusEnding's fixed classification, replacing the revoked never-drafted rule; the test that asserted
    the revoked rule's behavior was updated to assert this rule's behavior instead.
- node: rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
  encoded_at:
  - src/connector-registry/connector-configuration-draft-generation.ts
  how: Implemented only for its response-$ref-and-description clause, per the task's own REMAINDER note
    -- statusReadingOf reads response.description as already resolved through any $ref by the upstream
    openapi-operation-reader, and carries it forward unchanged as declared_as.
inferences:
- inferred: The two routes-spec fixtures' expected JSON key order for the drafted configuration string
    is method, address, statusMap (no query/headers/body keys), since neither fixture operation declares
    parameters, a request body, or a security scheme.
  from: Reading the current draftedConfigurationText object literal, whose conditional spreads for query/headers/body
    sit between address and the unconditional statusMap key, and confirming both fixtures resolve none
    of those three.
preserved:
- connector-configuration-draft-generation.spec.ts's coverage of address composition, parameter/header/cookie/body
  placement, unresolved reasons, generated_credentials, method_mismatch presence/absence, and the propagated-failure
  tests -- none touched.
- draft-connector-configuration-from-openapi.routes.spec.ts's coverage of validation-error responses,
  the 422 error-mapping tests, the exact-key-set test, and the generated_credentials/unresolved-shape
  tests -- none touched beyond the two configuration-string literals.
deferred:
- what: Adding a criterion for a purely numeric responses key outside 100-599 (e.g. 42 or 600) producing
    no statusMap entry.
  why: The task's own Notes flag this as UNDERDETERMINED and ask that a criterion be added to the specification;
    extending the specification is outside this implementation task.
- what: Adding a criterion covering a response declared as a $ref to a reusable components/responses object.
  why: Same UNDERDETERMINED note in the task -- the specification, not this implementation, is where that
    criterion belongs.
---

## What it is
The generator now always states a statusMap in the drafted configuration (empty when the operation declares no numeric-status response), and draft.status_readings discloses the document's own description beside each drafted ending -- replacing the revoked never-states-a-statusMap/responseMap behavior for the status half.

## Notes
Two build rounds: round 1 (test-unit red -- one pre-existing test asserting the revoked rule's old behavior, two pre-existing route tests asserting an exact configuration string now missing the always-present statusMap key), round 2 green.
responseMap and reading_notes remain [] placeholders, owned by sibling tasks not yet delivered.
