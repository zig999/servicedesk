---
title: Proof for the generic HTTP adapter behind IObservationSource
summary: What proves task/http-observation-runtime/http-declarative-observation-source, written against
  its implementation record — every criterion and every recorded inference held by a test that fails for
  a stated reason, with the network, the capability registry and the connector-configuration registry
  stood in for and no real call made.
implementation: sha256:be2420123f5bbd3d0cef7776c01de790aab95733f542bc74378382e7c2954881
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/http-observation-runtime-http-declarative-observation-source-suite-2
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: implements the existing IObservationSource port with an unmodified observeConcept(concept, subject,
    requester) signature
  proves: '"The adapter implements observeConcept(concept, subject, requester) at the existing IObservationSource
    port, requiring no change to the port''s signature or to evidence-collection-stage.ts''s call site."
    — the adapter is assigned to a variable typed as the port itself and exercised through it.'
  fails_when: the adapter stops satisfying IObservationSource's exact signature (a compile failure), or
    observeConcept through the port stops answering an ObservationOutcome.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: imports no HTTP client package, reaching the network only through the platform global fetch
  proves: the "any HTTP client package it uses" half of "The adapter and any HTTP client package it uses
    live outside the domain layer, and no domain module imports either directly" — the adapter uses none,
    so there is nothing for a domain module to import but the adapter itself.
  fails_when: the adapter's source gains an import of axios, node-fetch, got, undici, superagent or request.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: is imported by no domain module, so the domain layer reaches this adapter only through the IObservationSource
    port
  proves: the "no domain module imports either directly" half of "The adapter and any HTTP client package
    it uses live outside the domain layer, and no domain module imports either directly" — the sweep reads
    the domain layer as constraints/the-domain-depends-on-no-infrastructure names it (case behavior, vocabulary,
    and the non-adapter investigation modules) and refuses an empty file set so it cannot pass vacuously.
  fails_when: any module under src/case, src/glossary, or any non-adapter module under src/investigation
    gains a static, dynamic or re-export import of http-declarative-observation-source.adapter.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: defaults its own HTTP client to the platform global fetch when the caller injects none
  proves: the inference that the constructor takes an optional httpClient defaulting to the global fetch,
    so the injectable seam is a choice a caller may skip rather than a requirement.
  fails_when: an adapter constructed without an httpClient stops reaching globalThis.fetch, or reaches
    it more than once.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: issues exactly one outbound call per observeConcept invocation
  proves: '"Each observeConcept invocation issues exactly one outbound call to the external system, never
    more than one per concept per collection attempt."'
  fails_when: a retry loop, a pre-flight or a duplicate call makes the injected httpClient see anything
    but one call.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: issues its own single call for each of two concurrent observeConcept invocations, settling each
    from its own connector's own response
  proves: '"Each observeConcept invocation issues exactly one outbound call to the external system, never
    more than one per concept per collection attempt." — under the collection stage''s own concurrent
    per-concept fan-out, plus the two-operations-at-once edge case.'
  fails_when: concurrent invocations share, drop or cross their calls — the call count departs from two,
    or either outcome carries the other's observation.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: resolves which external system to reach entirely from the calling capability's own connector value,
    reaching a distinct host per registered connector
  proves: '"Which external system a call reaches is resolved entirely from the calling capability''s own
    connector value at call time; no external system''s name, host or shape is hard-coded in the adapter''s
    source, so a newly registered connector is reachable without a new deploy."'
  fails_when: the adapter stops reading the address from the connector's own registered configuration
    at call time — both calls land on one host, or on a host neither configuration declared.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: rejects with a typed ConnectorConfigurationNotRegisteredError, never one of the four endings,
    when the capability's own connector names no configuration currently registered
  proves: the inference that an absent connector-configuration lookup inside observeConcept is a genuine
    unexpected fault raised as a typed error, never degraded to one of the four endings.
  fails_when: an unregistered connector resolves to an evidence-result ending, or raises anything but
    the typed error.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries an observation on the ok ending
  proves: '"A call that completes resolves to exactly one of the four evidence-result endings (ok, unavailable,
    denied, timeout); ok is the only one of the four that carries an observation." — the ok half.'
  fails_when: 'a status mapped to ok stops answering {result: ''ok''} with the extracted observation as
    a JSON string.'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries no observation field on a non-ok ending, resolving exactly to its own result
  proves: '"A call that completes resolves to exactly one of the four evidence-result endings (ok, unavailable,
    denied, timeout); ok is the only one of the four that carries an observation." — the non-ok half,
    by exact-shape equality so a smuggled observation field fails it.'
  fails_when: 'a status mapped to denied answers anything but exactly {result: ''denied''}, including
    an observation beside it.'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: defaults an HTTP status absent from the connector's own status map to the unavailable ending,
    rather than leaving it unclassified
  proves: '"Every HTTP response status the external system can return resolves to exactly one of the four
    evidence-result endings the adapter can produce; no status value falls through unclassified or causes
    a thrown exception in place of one of the four." — together with the recorded inference that the unmapped-status
    default is ''unavailable'', so the free technical choice is pinned rather than incidental.'
  fails_when: an unmapped 500 throws, resolves to a value outside the four, or the default stops being
    unavailable.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: never throws for a status its own connector configuration does not classify, answering one of
    the four endings instead
  proves: '"Every HTTP response status the external system can return resolves to exactly one of the four
    evidence-result endings the adapter can produce; no status value falls through unclassified or causes
    a thrown exception in place of one of the four." — at the far edge of the status range (599).'
  fails_when: any reachable status makes observeConcept reject instead of resolving to one of the four.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: resolves to the timeout ending, rather than throwing, once its own bound elapses before the call
    completes
  proves: '"A call that has not completed by its own bound elapsing resolves to the timeout ending, recorded
    as evidence, rather than raising an exception that would abort the collection stage." — the httpClient
    stand-in rejects only in reaction to the adapter''s own AbortSignal, the shape a real aborted fetch
    takes.'
  fails_when: 'the elapsed bound surfaces as a rejection, or as any ending but {result: ''timeout''}.'
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: resolves to timeout immediately when the capability declares a zero-length timeout, the lower
    boundary
  proves: '"A call that has not completed by its own bound elapsing resolves to the timeout ending, recorded
    as evidence, rather than raising an exception that would abort the collection stage." — at the lower
    boundary of the declared range.'
  fails_when: a zero timeout is treated as no timeout, or the immediate abort escapes as a thrown fault.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: propagates a genuine network failure unmodified, rather than degrading it to one of the four endings
  proves: the inference that a rejection that is not the adapter's own timeout is a genuine unexpected
    fault propagated uncaught — the same convention evidence-collection-stage.ts documents — so the never-throw
    contract stays scoped to the four endings rather than swallowing real faults.
  fails_when: a network failure is reclassified into an evidence-result ending, or its own error is replaced.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: does not resolve before a capability's own longer declared timeout elapses, refuting a small fixed
    timeout unrelated to it
  proves: '"The client-side timeout the adapter applies to its own call is never greater than the calling
    capability''s own declared timeout, so a capability''s own timeout can never hold the collection stage''s
    seven-second budget hostage past what that budget still allows." — together with the binder''s carried-forward
    underdetermination note: an adapter applying a small fixed timeout (e.g. 50ms) unrelated to the capability''s
    declared 300ms settles before 299ms and fails here.'
  fails_when: the applied bound stops tracking the capability's own declared value from below — the call
    settles at or before 299ms of a 300ms declaration, or fails to settle at 300ms.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: resolves to timeout by the moment a different, shorter capability-declared timeout elapses, refuting
    a large fixed timeout unrelated to it
  proves: '"The client-side timeout the adapter applies to its own call is never greater than the calling
    capability''s own declared timeout..." — the other bracket of the same criterion and note, plus the
    recorded inference that the applied bound is exactly capability.timeout: a fixed 300ms constant would
    leave a 40ms-declaring capability unsettled at 40ms and fail here.'
  fails_when: the applied bound exceeds the capability's own declared value — the call is still pending
    once 40ms elapses.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries the given requester into the assembled request unmodified, never a substituted service
    identity
  proves: '"The requester passed into observeConcept is available to the call the adapter constructs,
    never substituted by a service-level identity, for a connector whose call needs it for scoping." —
    a marker requester surfaces verbatim in the URL a ${requester} placeholder resolves into.'
  fails_when: the requester is dropped, renamed or replaced before the request is assembled.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: carries a different requester into a different call rather than reusing a fixed identity across
    calls
  proves: '"The requester passed into observeConcept is available to the call the adapter constructs,
    never substituted by a service-level identity..." — the substitution half: a cached or service-level
    identity would make the second call repeat the first''s.'
  fails_when: two invocations with different requesters produce calls that do not each carry their own.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: keys the ok observation by the capability's own output_schema property names, dropping a response-map
    field the schema does not declare, and never surfacing the response's own raw field name
  proves: '"The observation returned on the ok ending is keyed by the calling capability''s own output_schema
    property names, never by a field name taken verbatim from the external response''s own structure."
    and "The translation from the external response''s own structure into the returned observation happens
    entirely inside the adapter... so no source-system field name crosses past the adapter." — plus the
    recorded inference that the observation is filtered to exactly declaredFieldsOf(output_schema).'
  fails_when: a raw_vendor field name survives into the returned observation, the undeclared unwanted_extra
    field is not dropped, or the declared glossary key stops carrying the extracted value.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: rejects with a typed CapabilityNotResolvedForObservationError, never one of the four endings,
    when no capability currently answers the concept
  proves: the inference that an absent capability lookup inside observeConcept — a race with whatever
    already checked — is a typed unexpected fault, never degraded to an ending. (Absent-input edge case.)
  fails_when: an unregistered concept resolves to an evidence-result ending, or raises anything but the
    typed error.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: refuses with a typed MalformedHttpConnectorConfigurationError, before any request is assembled,
    when the connector's own configuration does not declare a recognized method
  proves: 'the inference that a malformed connector configuration is refused as a typed fault before any
    request is assembled — the operation-against-state-that-forbids-it edge case: no call goes out for
    a configuration the adapter cannot honor.'
  fails_when: a malformed configuration reaches the httpClient, resolves to an ending, or raises an untyped
    error.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: issues the connector's own declared HTTP method rather than defaulting to GET, for a read-only
    capability whose own endpoint requires POST
  proves: the inference that a connector's declared method is not restricted to GET, the read-only guarantee
    living at capability registration rather than in a verb refusal here.
  fails_when: the adapter forces GET, or drops the connector's own declared method from the issued call.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: serializes a non-string resolved request body as JSON before sending it
  proves: the inference that a non-string resolved body is sent as JSON.stringify(body), with placeholders
    already resolved.
  fails_when: an object body is sent unserialized, double-encoded, or with its placeholders unresolved.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: sends an already-string resolved request body verbatim, without double-encoding it
  proves: the other half of the same inference — a string body travels verbatim, no content-type or encoding
    injected by the adapter.
  fails_when: a string body arrives JSON-quoted or otherwise re-encoded.
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: treats a response body that is not valid JSON as nothing extracted, rather than throwing, on the
    ok path
  proves: 'the inference that an unparseable ok body is treated as undefined — extraction finds nothing
    at every path — extending response-path-extractor.ts''s own posture rather than aborting the call.
    (Empty-collection edge case: the observation comes back empty, not absent, not thrown.)'
  fails_when: an unparseable body makes the ok path reject, or answers anything but an empty observation
    object.
- file: src/__tests__/unit/investigation/observation-source-modules.spec.ts
  name: 'ships exactly two concrete classes implementing IObservationSource: the fake, and this epic''s
    own generic HTTP adapter'
  proves: the task's objective that HttpDeclarativeObservationSource is a real, second concrete implementer
    of the port — this is the sibling proof's totality check, rescoped by this task's own test-author
    (the file's third retroactive correction discloses it) because this task's arrival legitimately broke
    the previous exactly-one count; the rescoped totality is owned jointly by task/evidence-collection/observation-source-port's
    criterion 2 and this task's objective.
  fails_when: the adapter stops implementing IObservationSource, is removed or renamed, or a third implementer
    lands that neither task's criteria establish.
not_applicable:
- edge_case: a duplicate where uniqueness is claimed
  why: this adapter claims no uniqueness of its own — one capability per concept and one configuration
    per connector are the registries' registration-time rules, and the adapter only reads whatever each
    answers; the port-implementer totality that does exist is asserted where it is owned, in observation-source-modules.spec.ts.
- edge_case: the upper boundary of the timeout range
  why: no bound node states a maximum this adapter must clamp a declared timeout to — the seven-second
    collection-wide budget and its remaining-time clamp are evidence-collection-stage.ts's own unchanged
    orchestration, outside this task per its own Notes, so a test clamping here would assert a guarantee
    nobody made at this layer.
- edge_case: an absent or empty requester string
  why: no bound node states a refusal for one; criterion 8's whole obligation is pass-through unchanged,
    which the two requester tests assert — a refusal invented here would state a domain fact the specification
    does not hold.
- edge_case: shared state between tests
  why: every test constructs its own adapter, fakes and clock (fake timers installed and restored per
    test); nothing touches a real store, network or filesystem write, so there is no order dependence
    to tear down.
untested:
- Criterion 1's "requiring no change ... to evidence-collection-stage.ts's call site" — that the call
  site is textually untouched is a diff fact no behavioral test can assert; behaviorally it is guarded
  by the standing evidence-collection-stage.spec.ts suite, which belongs to another task's proof and is
  not claimed here.
- The status-classification totality is proven by sampling each branch (a mapped ok, a mapped denied,
  an unmapped 500, an out-of-range 599), not by enumerating every status an external system can return;
  the default branch is what makes the function total, and it is the branch the two unmapped-status tests
  exercise.
- 'Behavior against a real fetch — which faults a real network raises, redirect handling, real abort timing
  — is deliberately unexercised: the task''s own Notes state fixture-and-fake testability as the scope''s
  expectation, so every test stands in for the network, and what a genuine fault does is proven only as
  propagation of whatever the client rejects with.'
- The task Notes' clauses that reach no criterion of this task — the scenario's inconclusive/no-data evaluation
  outcome, the judgment stage's deadline-exceeded record, the persistence exception, and the seven-second
  collection budget — are excluded by nothing here; the Notes name where each belongs (the evaluation/judgment
  stage, the persistence stage, the unchanged collection orchestration), all outside this task, so no
  test was invented over them.
---

## What it is

The generic HTTP adapter behind IObservationSource: one outbound call per observation, endings resolved from the connector's own status map, the capability's own timeout as the client-side bound, and the observation keyed by the capability's output schema.

## Notes

This proof was composed after the delivery's own suite step: at delivery time the tree's suite was red on 2 pre-existing failures outside this change's file set — the closed EXPECTED_MIGRATION_FILENAMES enumeration owned by task/relational-substrate/migration-step of the relational-persistence initiative — and a record over a run that did not pass is refused, so no proof was written then.
That assertion was re-judged whole through the proof-only re-delivery of its owning task, the suite is green, and this record cites its own passing captured run.
One test was added by this judgment — the domain-import sweep over the adapter itself — closing criterion 10's no-domain-module-imports half with a sweep that refuses an empty file set so it cannot pass vacuously.
