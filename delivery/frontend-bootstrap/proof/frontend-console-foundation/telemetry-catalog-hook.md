---
title: Proof for the telemetry event catalog hook
summary: Tests over useTelemetry() proving the eight cataloged events are exposed, each sinks exactly once to a correctly-namespaced console.info call carrying its own payload, calling one never fires any of the other seven, and no callable ever reaches the network.
implementation: sha256:baa25628e9a31bbe59cf33f0dac2cce540f5a0a91e3097db47718f6e1bf834de
run: run/frontend-console-foundation-onda-1-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/hooks/use-telemetry.spec.ts
    name: exposes exactly the eight cataloged events, each as its own callable
    proves: The hook exposes exactly the eight events section 3's catalog names, each as its own callable.
    fails_when: the object useTelemetry() returns gains, loses, or renames a key relative to the eight the catalog names, or any of the eight keys does not hold a function
  - file: src/hooks/use-telemetry.spec.ts
    name: 'calling caseDraftCreated emits a console.info call namespaced telemetry:case_draft.created carrying its payload'
    proves: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    fails_when: caseDraftCreated's console.info call carries a prefix other than telemetry:case_draft.created, or a payload other than the one passed to it
  - file: src/hooks/use-telemetry.spec.ts
    name: 'calling caseDraftUpdated emits a console.info call namespaced telemetry:case_draft.updated carrying its payload'
    proves: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    fails_when: caseDraftUpdated's console.info call carries a prefix other than telemetry:case_draft.updated, or a payload other than the one passed to it
  - file: src/hooks/use-telemetry.spec.ts
    name: 'calling caseDraftDiscarded emits a console.info call namespaced telemetry:case_draft.discarded carrying its payload'
    proves: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    fails_when: caseDraftDiscarded's console.info call carries a prefix other than telemetry:case_draft.discarded, or a payload other than the one passed to it
  - file: src/hooks/use-telemetry.spec.ts
    name: 'calling caseReleased emits a console.info call namespaced telemetry:case.released carrying its payload'
    proves: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    fails_when: caseReleased's console.info call carries a prefix other than telemetry:case.released, or a payload other than the one passed to it
  - file: src/hooks/use-telemetry.spec.ts
    name: 'calling manifestHypothesisPlaced emits a console.info call namespaced telemetry:manifest.hypothesis_placed carrying its payload'
    proves: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    fails_when: manifestHypothesisPlaced's console.info call carries a prefix other than telemetry:manifest.hypothesis_placed, or a payload other than the one passed to it
  - file: src/hooks/use-telemetry.spec.ts
    name: 'calling manifestHypothesisRemoved emits a console.info call namespaced telemetry:manifest.hypothesis_removed carrying its payload'
    proves: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    fails_when: manifestHypothesisRemoved's console.info call carries a prefix other than telemetry:manifest.hypothesis_removed, or a payload other than the one passed to it
  - file: src/hooks/use-telemetry.spec.ts
    name: 'calling hypothesisRevised emits a console.info call namespaced telemetry:hypothesis.revised carrying its payload'
    proves: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    fails_when: hypothesisRevised's console.info call carries a prefix other than telemetry:hypothesis.revised, or a payload other than the one passed to it
  - file: src/hooks/use-telemetry.spec.ts
    name: 'calling uiStaleConflictDetected emits a console.info call namespaced telemetry:ui.stale_conflict_detected carrying its payload'
    proves: Each call's console.info output is namespaced with a consistent prefix identifying it as a telemetry event, rather than a bare message.
    fails_when: uiStaleConflictDetected's console.info call carries a prefix other than telemetry:ui.stale_conflict_detected, or a payload other than the one passed to it
  - file: src/hooks/use-telemetry.spec.ts
    name: calling caseDraftCreated triggers console.info exactly once, so none of the other seven fires alongside it
    proves: Calling any one of the eight does not call any of the other seven.
    fails_when: calling caseDraftCreated causes console.info to be invoked any number of times other than exactly one
  - file: src/hooks/use-telemetry.spec.ts
    name: calling caseDraftUpdated triggers console.info exactly once, so none of the other seven fires alongside it
    proves: Calling any one of the eight does not call any of the other seven.
    fails_when: calling caseDraftUpdated causes console.info to be invoked any number of times other than exactly one
  - file: src/hooks/use-telemetry.spec.ts
    name: calling caseDraftDiscarded triggers console.info exactly once, so none of the other seven fires alongside it
    proves: Calling any one of the eight does not call any of the other seven.
    fails_when: calling caseDraftDiscarded causes console.info to be invoked any number of times other than exactly one
  - file: src/hooks/use-telemetry.spec.ts
    name: calling caseReleased triggers console.info exactly once, so none of the other seven fires alongside it
    proves: Calling any one of the eight does not call any of the other seven.
    fails_when: calling caseReleased causes console.info to be invoked any number of times other than exactly one
  - file: src/hooks/use-telemetry.spec.ts
    name: calling manifestHypothesisPlaced triggers console.info exactly once, so none of the other seven fires alongside it
    proves: Calling any one of the eight does not call any of the other seven.
    fails_when: calling manifestHypothesisPlaced causes console.info to be invoked any number of times other than exactly one
  - file: src/hooks/use-telemetry.spec.ts
    name: calling manifestHypothesisRemoved triggers console.info exactly once, so none of the other seven fires alongside it
    proves: Calling any one of the eight does not call any of the other seven.
    fails_when: calling manifestHypothesisRemoved causes console.info to be invoked any number of times other than exactly one
  - file: src/hooks/use-telemetry.spec.ts
    name: calling hypothesisRevised triggers console.info exactly once, so none of the other seven fires alongside it
    proves: Calling any one of the eight does not call any of the other seven.
    fails_when: calling hypothesisRevised causes console.info to be invoked any number of times other than exactly one
  - file: src/hooks/use-telemetry.spec.ts
    name: calling uiStaleConflictDetected triggers console.info exactly once, so none of the other seven fires alongside it
    proves: Calling any one of the eight does not call any of the other seven.
    fails_when: calling uiStaleConflictDetected causes console.info to be invoked any number of times other than exactly one
  - file: src/hooks/use-telemetry.spec.ts
    name: passes a payload lacking the optional source_version through unchanged
    proves: caseDraftCreated's payload (source_version optional) is passed to console.info exactly as given, with no field added or defaulted, when that field is absent
    fails_when: emit() adds, removes, or substitutes a default for any field when source_version is absent from the payload passed to caseDraftCreated
  - file: src/hooks/use-telemetry.spec.ts
    name: never invokes fetch for any of the eight cataloged events
    proves: No network call or real telemetry endpoint is invoked -- the sink is console.info only, matching the decision recorded in temp/frontend-console-decisions.md.
    fails_when: any of the eight callables invokes fetch, directly or through a wrapped client, instead of or in addition to console.info
not_applicable:
  - edge_case: an absent or empty value for any of the seven required payload fields across the eight event types
    why: every field but CaseDraftCreatedPayload's source_version is required by its own exported TypeScript interface, so a call omitting one is refused by the compiler before any test could reach it at runtime; the one field that actually can be absent is covered by its own test
  - edge_case: a boundary at each end of a stated numeric range (version, position, revision)
    why: no criterion and no payload type states a bounded range for any numeric field -- each is a plain number the hook passes through unexamined
  - edge_case: an empty collection where one comes back
    why: useTelemetry() returns a fixed object of eight callables, never a collection of records
  - edge_case: a duplicate where uniqueness is claimed
    why: no criterion claims any event or payload is unique, and each callable is a stateless closure with no cache or counter
  - edge_case: an operation against state that forbids it
    why: the hook holds no internal or shared state across calls
  - edge_case: a dependency that fails or answers slowly
    why: the only thing any callable reaches is a synchronous console.info call, which has no failure mode and nothing to await
  - edge_case: two operations against one subject at once
    why: every callable is synchronous and stateless with no shared mutable data between calls
untested:
  - a runtime call passing a payload that violates its declared interface (e.g. a required field of the wrong type or missing outright) -- TypeScript refuses such a call at compile time, and the hook performs no runtime validation of its own, so no test can construct a violating call without defeating the type system
---

## What it is
Nineteen tests over useTelemetry(): the eight-callable shape, one namespacing/payload test per event, one isolation test per event confirming no cross-firing, one optional-field passthrough test, and one no-network test.

## Notes
None.
