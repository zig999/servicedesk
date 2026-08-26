---
title: Proof for collection stage recording the observation's result detail
summary: Tests added to evidence-collection-stage.spec.ts proving settledEvidence copies an unavailable
  ObservationOutcome's result_detail into Evidence, for each of the four newly classified causes and when
  absent, while denied and observation-reported timeout endings keep dropping any result_detail they carry.
implementation: sha256:4c7b45a71c61cc28a8886cc7321f385e5917f0086faa7fefa5e0fcca446dec32
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/observation-endings-and-collection-budget-collection-stage-records-result-detail-suite
tests:
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: carries %s as the evidence result_detail for a held capability whose observation ends unavailable
    for that cause (rules/integration/an-unresolvable-observation-ends-unavailable, rules/integration/an-http-connector-configuration-declares-its-call)
    — it.each over CapabilityNotResolvedForObservationError, DuplicateConceptAnswerError, ConnectorConfigurationNotRegisteredError,
    MalformedHttpConnectorConfigurationError
  proves: Evidence written for a concept whose observation ends unavailable for one of the four newly
    classified causes carries a result_detail naming that cause.
  fails_when: settledEvidence's unavailable branch stops copying outcome.result_detail into Evidence.result_detail
    for any one of the four cause strings, or copies a different value than the one the observation reported
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: carries no result_detail for an unavailable ending the observation reported without one, rather
    than requiring one to be present or inventing one
  proves: the implementation record's own inference — the collection stage copies outcome.result_detail
    unconditionally for every 'unavailable' outcome, rather than filtering on which cause produced it
    or requiring result_detail to be present
  fails_when: the branch starts requiring result_detail to be present (e.g. throwing or substituting a
    default) instead of passing an absent value through as absent
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: drops a result_detail the observation reported on a denied ending, leaving evidence for denied
    unchanged from before this task
  proves: Evidence written for a concept whose observation ends ... denied ... is unchanged from before
    this task.
  fails_when: settledEvidence's fallthrough branch starts reading outcome.result_detail for a 'denied'
    ending instead of leaving Evidence.result_detail absent
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: drops a result_detail the observation reported on its own timeout ending, distinct from the stage's
    own race timeout, leaving evidence for timeout unchanged from before this task
  proves: Evidence written for a concept whose observation ends ... timeout is unchanged from before this
    task — specifically the ending observe-concept itself answers, as opposed to the stage's own local
    race-timeout mark, which no pre-existing test exercised with a result_detail present to drop
  fails_when: settledEvidence's fallthrough branch starts reading outcome.result_detail for an observe-concept-reported
    'timeout' ending instead of leaving Evidence.result_detail absent
not_applicable:
- edge_case: an 'ok' ending carrying a result_detail
  why: 'ObservationOutcome''s ''ok'' variant has no result_detail field in its type at all (only { result
    ''ok''; observation: string }), so this cannot be constructed or observed at runtime; a test asserting
    against it would assert a state TypeScript itself refuses'
- edge_case: two collectEvidence calls, or two concepts within one call, racing each other over this same
    code path
  why: this task changes only how one already-resolved ObservationOutcome is copied into one Evidence
    entry — no new shared state, timer or ordering dependency is introduced, and the pre-existing parallel-concepts
    test already exercises this stage's concurrency behavior unmodified by this task
- edge_case: a dependency (capability registry or observation source) that is slow or fails
  why: this task does not touch how long a call takes or whether it rejects — settledEvidence receives
    an already-settled ObservationOutcome or the pre-existing TIMED_OUT marker; the pre-existing budget
    and rejection-propagation tests already cover that behavior and are untouched by this task's change
- edge_case: a numeric boundary (zero, negative, maximum)
  why: this task's criteria concern which string reaches result_detail, not a bound or a count; no boundary
    is introduced
untested:
- Whether the production HTTP adapter actually reports these four exact strings as .name for its own error
  classes — that is the sibling task's own criteria (task/observation-endings-and-collection-budget/observation-port-unavailable-endings)
  and its own proof; this proof only exercises what the collection stage does once an ObservationOutcome
  carrying such a string reaches it, via the FakeObservationSource stand-in.
---

## What it is

Tests prove the collection stage copies an unavailable observation outcome's result_detail into the written evidence, for each of the four newly classified causes and when absent, while denied and timeout endings keep dropping any result_detail unchanged.

## Notes

None.
