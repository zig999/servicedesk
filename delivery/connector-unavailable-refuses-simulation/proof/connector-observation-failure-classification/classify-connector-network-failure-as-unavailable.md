---
title: Connector transport-rejection classified as unavailable
summary: Proves that HttpDeclarativeObservationSource now resolves a connector call's
  transport-layer rejection to an unavailable ObservationOutcome naming ConnectorUnreachableError
  and the connector — end to end through evidence collection and hypothesis judgment
  — instead of letting it propagate uncaught, while leaving every other resolution-step
  cause, the timeout path and ConnectorUnreachableError's own cause-preservation untouched.
implementation: sha256:e93bffd24400d849ac917225ebd79b361ecc4e24479645e1240cb02300753d84
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-observation-failure-classification-classify-connector-network-failure-as-unavailable-suite-6
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: resolves to unavailable naming ConnectorUnreachableError and the connector,
    rather than throwing, when the issuing call rejects before any HTTP response is
    received
  proves: 'Criterion 1''s core claim — a connector call whose issuing step rejects
    (for a reason other than the timeout AbortController firing) resolves observeConcept
    to { result: ''unavailable'', result_detail: naming ConnectorUnreachableError
    and the connector }, and does not throw.'
  fails_when: issueRequestOrUnreachable stops catching the issuing step's rejection
    (letting it propagate uncaught again, as the pre-existing test it replaces here
    once asserted) or stops naming both ConnectorUnreachableError and the connector
    in result_detail.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: classifies a DNS-resolution-style TypeError the same way as any other transport
    rejection, resolving to unavailable rather than throwing
  proves: The objective's named edge case 'a DNS resolution failure' — the classification
    is not narrowed to one rejection shape.
  fails_when: the catch is narrowed to only some rejection types (e.g. only plain
    Error) so a TypeError-shaped transport failure propagates uncaught or is classified
    differently from a plain Error rejection.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: classifies a rejection that is not an Error instance at all as unavailable
    too, rather than crashing while building the cause
  proves: 'The classification holds for any rejection reason, including a non-Error
    value, matching ConnectorUnreachableError''s own cause: unknown typing.'
  fails_when: constructing ConnectorUnreachableError's cause from a non-Error rejection
    value throws instead of resolving to unavailable, or the rejection is left to
    propagate uncaught.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: classifies an abort-shaped rejection as unavailable rather than timeout when
    the capability's own timeout controller never actually fired
  proves: Criterion 1's discrimination clause — 'for a reason other than the timeout
    AbortController firing' — is decided by the capability's own controller state,
    not by the rejection's own shape or name.
  fails_when: the classification starts keying off the rejection's own name/shape
    (e.g. treating any AbortError-named rejection as a timeout) instead of the capability's
    own AbortController state, misclassifying this case as timeout instead of unavailable.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: keeps result_detail free of the call's own assembled address, query, headers
    and body, naming only the cause and the connector
  proves: Criterion 1's negative clause — result_detail carries no part of the call's
    own assembled address, query, headers or body.
  fails_when: result_detail is built from any part of the assembled request (address,
    query, headers or body) instead of from the cause name and the connector alone.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: records evidence naming ConnectorUnreachableError and the connector, the same
    shape as an existing unavailable cause, when the real adapter's own connector
    call rejects before any response
  proves: Criterion 2 — the evidence recorded for the concept carries result unavailable
    and a result_detail naming ConnectorUnreachableError and the connector, the same
    shape as the existing unavailable causes — proven end to end through a real HttpDeclarativeObservationSource
    and collectEvidence, not merely a seeded fake outcome.
  fails_when: the real adapter's transport rejection stops resolving to an unavailable
    ObservationOutcome naming ConnectorUnreachableError and the connector, or evidence-collection-stage.ts
    stops forwarding that result/result_detail into the Evidence item unchanged.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: judges a hypothesis inconclusive no-data, citing the evidence, when its own
    evidence carries the connector-unreachable cause — while a sibling hypothesis
    whose own evidence is ok is judged normally, unaffected — mirroring the mechanism
    a-collection-timeout-degrades-to-no-data already exercises for a timeout
  proves: Criteria 4 and 5 together — a hypothesis whose collection plan includes
    the failing concept is judged inconclusive no-data citing that evidence, while
    a sibling hypothesis in the same case whose plan does not include it is judged
    normally, unaffected.
  fails_when: a hypothesis whose only evidence carries this connector-unreachable
    cause stops being judged inconclusive no-data citing that evidence, or a sibling
    hypothesis's own evaluation is affected by that failure (wrong verdict, wrong
    citations, or coupled outcome).
- file: src/__tests__/unit/errors/connector-unreachable.error.spec.ts
  name: names itself ConnectorUnreachableError and carries only the connector in its
    context
  proves: The node's own shape requirement (per the task's ADVISORY note) — the error's
    name and its context carrying only the connector.
  fails_when: ConnectorUnreachableError's name is not exactly 'ConnectorUnreachableError'
    or its context carries any field beyond connector.
- file: src/__tests__/unit/errors/connector-unreachable.error.spec.ts
  name: preserves the underlying transport rejection as its own cause, even though
    nothing reads it back out through a caller-visible field
  proves: The implementation's recorded inference that ConnectorUnreachableError's
    constructor accepts an ErrorOptions ({ cause }) so the underlying rejection is
    preserved as .cause without ever reaching a caller-visible field.
  fails_when: the constructor stops forwarding options.cause to .cause, or the cause
    instead becomes visible through context, message or result_detail.
- file: src/__tests__/unit/errors/connector-unreachable.error.spec.ts
  name: constructs with no cause at all when none is given, rather than requiring
    one
  proves: The cause is optional, matching the constructor's own optional ErrorOptions
    parameter.
  fails_when: constructing without a cause throws, or sets a defined .cause where
    none was given.
- file: src/__tests__/unit/errors/connector-unreachable.error.spec.ts
  name: names only the connector in its own message, never an address, query, header
    or body value
  proves: The error's own message construction is safe by itself (never embeds a URL),
    reinforcing criterion 1's no-leakage clause at the source of the cause rather
    than only at the adapter's call site.
  fails_when: the message is changed to embed an address, query, header or body value,
    or stops naming the connector at all.
not_applicable:
- edge_case: Two concurrent observeConcept calls, one of whose connector rejects,
    corrupting or blocking the sibling call
  why: Each call constructs its own AbortController and timer inside issueConnectorHttpCall
    with no shared mutable state; issueRequestOrUnreachable's catch adds no new shared
    state either. The pre-existing, unmodified adapter test 'issues its own single
    call for each of two concurrent observeConcept invocations' and 'proceeds with
    every other concept unaffected... when one concept... degrades to unavailable'
    (using a different cause) already establish this independence for the same code
    shape.
- edge_case: A boundary at either end of the capability's timeout range (zero timeout,
    remaining-budget clamping)
  why: This task adds a catch around the pre-existing issueRequest call; it does not
    touch effectiveTimeoutMsFor or issueConnectorHttpCall's own timer. The timeout
    boundary is unmodified and already covered by the pre-existing timeout tests in
    this file.
- edge_case: Absent or empty concept, subject or requester input
  why: This task's change is scoped to the issuing step's catch, reached only after
    capability resolution, connector-configuration resolution, HTTP-configuration
    validation and request assembly have already succeeded; input validity is refused
    earlier, in resolution steps this task does not touch.
- edge_case: A duplicate or uniqueness violation
  why: No uniqueness constraint is introduced or touched by this task; DuplicateConceptAnswerError's
    own existing handling is untouched.
- edge_case: An operation attempted against state that forbids it
  why: This task adds no state machine or stateful precondition; it only reclassifies
    a transport-layer rejection that was previously left to propagate.
untested:
- Criterion 3 — that the unavailable observation this failure produces is never written
  into an evidence cache — has no test exercising an actual write attempt. No evidence-cache
  adapter exists anywhere in the target source root (confirmed by search across src/),
  so there is no call site to instrument or observe a non-write against. The claim
  currently holds only by the total absence of any component that could perform such
  a write, which is a structural fact about the codebase rather than a behavior any
  test here can exercise; the absence of a positive, present-day test for this criterion
  is itself what a reviewer would need to re-examine once an evidence cache is ever
  introduced.
- Criterion 6's own claim that a simulate-case or simulate-hypothesis call whose subject
  is missing the concept's attribute is not refused for that reason, and that the
  connector's own timeout-abort path is unchanged, is not exercised by a new test
  written for this task — the delivery touches no code on either path, and both are
  covered by this suite's own pre-existing, unmodified tests (the timeout tests in
  http-declarative-observation-source.adapter.spec.ts, and the degrade-not-refuse
  tests elsewhere in this suite), which this run re-executes and which continue to
  pass unchanged.
---

## What it is
Proves the connector transport-rejection classification end to end: the adapter's own outcome, the evidence it produces, the hypothesis judgment that follows, and ConnectorUnreachableError's own shape.

## Notes
run/connector-observation-failure-classification-classify-connector-network-failure-as-unavailable-suite failed at the test step with 5 failures in 4 files none of which this delivery touched; the failure-diagnostician returned cause setup — the shared lab Postgres database carried migrations 0020 and 0021 applied by the then-unmerged worktree hipotese-release-proprio, which this checkout's own migrations (ending at 0019) never produce.
run/connector-observation-failure-classification-classify-connector-network-failure-as-unavailable-suite-2 was terminated by the harness for low system memory before the test step finished and wrote no run.json; no diagnosis was possible.
run/connector-observation-failure-classification-classify-connector-network-failure-as-unavailable-suite-3 was terminated by the harness for low system memory before the test step finished and wrote no run.json; no diagnosis was possible.
run/connector-observation-failure-classification-classify-connector-network-failure-as-unavailable-suite-4 failed at the test step with the same 5 failures as the first run; the failure-diagnostician returned cause setup again, the same database contamination, with every file this delivery touched passing.
run/connector-observation-failure-classification-classify-connector-network-failure-as-unavailable-suite-5 was terminated by the harness for low system memory before the test step finished and wrote no run.json; no diagnosis was possible.
The human then merged worktree-hipotese-release-proprio into this branch (commit faab25f), bringing migrations 0020 and 0021 into this checkout so code and the shared database agree; suite-6 is the first run over that aligned tree and passed whole, 152 files and 1883 tests.
