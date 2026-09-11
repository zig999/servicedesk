---
target: frontend
title: Frontend hook reading an OpenAPI document's operations — test proof
summary: Tests use-openapi-document-operations.ts against every stated criterion and the task's two UNDERDETERMINED
  notes, with fetch stubbed at the network boundary; two domain nodes are demonstrated whole, and the
  second UNDERDETERMINED note's test now asserts the specific openapi-document-declares-no-version kind
  the corrected implementation exposes, distinct from a generic parse failure — a stronger proof of the
  same fact than the prior inequality check.
implementation: sha256:f2f8a104ee70df146e462300af2e7208248d026bd2637aebc42afea6a104970e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/openapi-document-operations-read-suite-3
tests:
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: issues exactly one network call, to a route naming read-openapi-document-operations and carrying
    the link as data, never to the link itself
  proves: Criterion 1 (the read is issued through the api client against the backend's read-openapi-document-operations
    route) and criterion 2 (no request is issued to the operator-named link itself).
  fails_when: The hook issues more than one network call, issues a call whose target is the operator-named
    link itself rather than the backend's own route, or omits the link from the data reaching that route.
  demonstrates: constraints/the-openapi-document-is-fetched-by-the-backend
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: exposes an operations outcome carrying exactly the operations the answer listed, in one array
  proves: Criterion 3, the completeness half — every listed operation is exposed, none dropped, none paged.
  fails_when: The hook drops, pages, truncates, or reorders an operation the answer listed.
  demonstrates: domain/integration/openapi-document-operations
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: exposes an empty operations array, not a refusal or an absent outcome, when the answered document
    declares no operations
  proves: Criterion 3's empty-collection boundary — a document declaring zero operations is still an operations
    outcome, not a refusal or an undefined value.
  fails_when: A document declaring no operations is exposed as anything other than {kind:"operations",
    operations:[]}.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: exposes the answered path and method verbatim, and nothing else, for a document declaring one
    operation
  proves: Criterion 3, the per-entry half — an entry carries that operation's own path and its own method.
  fails_when: The exposed entry omits path or method, substitutes a different value than the one the answer
    named, or carries a field beyond path and method.
  demonstrates: domain/integration/openapi-operation
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: exposes a lower-cased method exactly as the answer named it, applying no upper-casing of its own
  proves: Criterion 4 — the hook applies no case change of its own to a method.
  fails_when: The hook transforms the case of an answered method value before exposing it.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: exposes openapi-document-not-fetched naming $label (network-failure, timeout, status-outside-2xx)
  proves: Criterion 5 — an OpenApiDocumentNotFetchedError refusal is exposed naming which of the three
    fetch-failure sub-kinds the answer named.
  fails_when: For any of the three fetch failures, the exposed outcome's failure.kind (or, for status-outside-2xx,
    its status) does not match what the answer named.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: carries the answered status code and the link exactly as the request named it, not merely the
    sub-kind
  proves: 'The task''s first UNDERDETERMINED note: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document''s
    shared vocabulary requires the status code and echoed link to reach the operator, though criterion
    5 names only the sub-kind.'
  fails_when: An implementation exposes only {kind:"openapi-document-not-fetched", failure:{kind:"status-outside-2xx"}}
    (or otherwise discards the answered status code or the echoed link) — exactly the implementation the
    note names as criterion-satisfying yet operator-blind.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: 'exposes OpenApiDocumentNotReadableError as {kind: ''openapi-document-not-readable''}, carrying
    no fetch-failure data'
  proves: Criterion 6 — an OpenApiDocumentNotReadableError refusal is exposed naming an unreadable document,
    never as the unfetchable-link outcome.
  fails_when: An OpenApiDocumentNotReadableError refusal is exposed under openapi-document-not-fetched,
    or under any kind other than one of the hook's unreadable-document kinds.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: exposes openapi-document-declares-no-version for a no-version-declared reason, and openapi-document-not-readable
    for a parse failure
  proves: 'The task''s second UNDERDETERMINED note: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
    requires a document declaring no version at all to be told apart from a generic parse failure, rather
    than both collapsing into one flat outcome.'
  fails_when: A no-version-declared reason and a parse-failure reason are exposed as the same outcome
    kind — the collapsing implementation the note names as criterion-satisfying yet rule-violating — or
    the no-version case is exposed under any kind other than openapi-document-declares-no-version.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: 'exposes {kind: ''unrecognized-failure''} for $label (an unrecognized error code; OpenApiDocumentNotFetchedError
    with unrecognizable details)'
  proves: Criterion 7 — an error value naming neither known condition, or a body not carrying the expected
    shape, is exposed as unrecognized-failure.
  fails_when: Either input is exposed as anything other than {kind:"unrecognized-failure"}.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: 'exposes {kind: ''unrecognized-failure''} for a raw, non-ApiError throw (the request itself failing
    outright)'
  proves: Criterion 7's third class — a failure that never reached an ApiError-wrapped shape at all.
  fails_when: A raw, non-ApiError throw is exposed as anything other than {kind:"unrecognized-failure"}.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: carries no operations field on the richest refusal outcome, openapi-document-not-fetched
  proves: Criterion 8 — a refusal outcome exposes no operation entries.
  fails_when: A refusal outcome carries an operations field.
- file: src/hooks/use-openapi-document-operations.spec.ts
  name: exposes the second link's operations, never the first link's, once the hook is re-keyed to it
  proves: Criterion 9 — reading a second link exposes that second link's own operations and never the
    entries the previously read link answered.
  fails_when: After the hook is re-keyed to a second link, the exposed outcome still carries the first
    link's operations, or fails to reach the second link's own operations.
not_applicable:
- edge_case: A second identical read dispatched while the first is still in flight (concurrent dispatch)
  why: This hook wraps a query, not a mutation; deduplicating an identical in-flight query key is TanStack
    Query's own library behavior, not code this hook's own logic implements, and no criterion requires
    testing it.
- edge_case: The 60000-millisecond fetch timeout and its abandonment
  why: Per the task's own REMAINDER notes, this is the backend read-openapi-document-operations operation's
    own conduct, which does not exist yet and cannot be exercised from this frontend-only test file.
- edge_case: A document listing duplicate path+method operations
  why: No criterion or node requires de-duplication; the pass-through behavior the completeness test already
    establishes covers reproducing exactly what the answer named, whatever it contains.
- edge_case: A pre-existing state (e.g. an in-progress draft) that would forbid the read
  why: No criterion names any precondition that forbids issuing this read; it is a stateless read keyed
    only by the link argument.
untested:
- contracts/integration/openapi-document-operations — the node's fact spans the backend read-openapi-document-operations
  operation's own conduct (fetching, generating no draft, issuing no register-connector call), which the
  backend operation does not yet implement (per the task's own 'What it is'); no test in this frontend-only
  file can decide that half of the fact, so no test claims it whole.
- rules/integration/a-configuration-helper-operation-is-chosen-from-the-fetched-documents-listing — its
  operator-choice and draft-issuing clauses are REMAINDER, belonging to the Configuration Helper surface
  task per the task's own Notes; this task's hook only supplies the listing, so no test here decides the
  invariant whole.
- rules/integration/an-openapi-operations-method-is-upper-cased — the guarantee that a method IS upper-cased
  is the backend's own conduct (per the task's own ADVISORY note); this hook only passes an answered method
  through unchanged (established by the case-preservation test), which is not the same fact as the rule's
  own upper-casing guarantee.
- rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read — its fetch-timing, pre-parse-refusal
  and 60000ms-timeout clauses are the backend operation's own conduct (REMAINDER per the task's own Notes);
  only the frontend-visible outcome-naming slice is reachable from this file, which is not the rule's
  whole statement.
- rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read — its parse-stage
  clauses (serialization decided by parsing, version detection) are backend REMAINDER. The implementation
  now differentiates the no-version-declared naming from the other two (tested via the UNDERDETERMINED-note-2
  test), but 'what failed to parse' and 'which version was declared' still collapse into one flat openapi-document-not-readable
  kind at this hook, so the rule's full three-way distinction is still not decided whole by any test in
  this file.
- rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document — its own
  statement is scoped to the draft operation, which this hook never calls; it reaches this task only through
  shared vocabulary (per the task's own ADVISORY note), and the one concrete concern it raises for this
  task is answered instead by the dedicated UNDERDETERMINED-note-1 test rather than by a test of the draft
  rule itself.
- rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  — its whole statement is about the backend's own HTTP-422-and-error-code answer, which this hook cannot
  observe (ApiError carries no status field in this codebase); only the frontend translation's disjointness
  is tested (criteria 5 and 6), which is a slice of the stated fact, not its whole.
- The 'idle' outcome for an empty link, and the exact shape/lifecycle of the 'pending' outcome, are inferences
  the implementation record itself flags as hook-lifecycle plumbing rather than a stated fact; no criterion
  names either, so no test pins their shape.
- The returned refetch function is arrangement no criterion or node requires; its invocation of query.refetch()
  is left unpinned.
---

## What it is

Tests use-openapi-document-operations.ts against every stated criterion and the task's two UNDERDETERMINED notes, with fetch stubbed at the network boundary; two domain nodes are demonstrated whole, and the second UNDERDETERMINED note's test now asserts the specific openapi-document-declares-no-version kind the corrected implementation exposes, distinct from a generic parse failure — a stronger proof of the same fact than the prior inequality check.

## Notes

run/openapi-document-operations-read-suite (suite-1): failed at step test — cause code, per the failure-diagnostician: the implementation collapsed a no-version-declared refusal into the same outcome as a generic parse failure, against rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read's own text; the implementation was revised.
run/openapi-document-operations-read-suite-2: failed at step test — cause test, per the failure-diagnostician: this proof's own assertion still expected the no-version case to settle on the stale flat kind name after the implementation had already been corrected to expose the new, distinct openapi-document-declares-no-version kind; the assertion was revised to expect that kind.
run/openapi-document-operations-read-suite-3: passed.
