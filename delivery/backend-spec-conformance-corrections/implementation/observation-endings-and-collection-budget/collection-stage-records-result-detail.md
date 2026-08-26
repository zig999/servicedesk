---
title: Collection stage copies an unavailable observation's result_detail into evidence
summary: settledEvidence now carries ObservationOutcome's own result_detail into the Evidence entry for
  an unavailable ending, leaving ok, denied and timeout untouched.
task: sha256:43b06d641acde968e9a69c590185c9191715a8cde68f0be42282f321eccc41c5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/observation-endings-and-collection-budget-collection-stage-records-result-detail-build
files:
- path: src/investigation/evidence-collection-stage.ts
  effect: settledEvidence gains a branch for outcome.result === 'unavailable' that copies outcome.result_detail
    straight into the Evidence entry's own result_detail field via evidenceOf, so the cause the observation
    port already resolved (rules/integration/an-unresolvable-observation-ends-unavailable's three named
    causes and rules/integration/an-http-connector-configuration-declares-its-call's fourth) reaches the
    record the investigation keeps. The 'ok' branch and the fallthrough for 'denied'/'timeout' are byte-for-byte
    unchanged from before this task, and so is settledEvidence's own local TIMED_OUT branch (this stage's
    own race timeout, distinct from a 'timeout' ObservationOutcome). The function's doc comment is extended
    to name the new behavior and the two rules it answers to.
criteria:
- criterion: Evidence written for a concept whose observation ends unavailable for one of the four newly
    classified causes carries a result_detail naming that cause.
  met: true
  how: each of the four causes already reaches this stage as an ObservationOutcome with result 'unavailable'
    and result_detail set to the raised error's own class name, from the sibling task's port widening
    and adapter rewrite (unavailableFor(error), the resolveHttpConnectorCallConfiguration wrapper). settledEvidence's
    new `if (outcome.result === 'unavailable')` branch passes that value straight through to evidenceOf
    as resultDetail, which writes it onto Evidence.result_detail — with no cause-specific branching needed
    here, since the port already decided which class name to report.
- criterion: Evidence written for a concept whose observation ends ok, denied or timeout is unchanged
    from before this task.
  met: true
  how: 'the ''ok'' branch (`evidenceOf(base, { result: ''ok'', observation: outcome.observation })`) is
    untouched. outcome.result === ''denied'' and outcome.result === ''timeout'' (an ending observe-concept
    itself answers, never this stage''s own race-timeout mark) both still fall through to the original,
    unmodified final line `return evidenceOf(base, { result: outcome.result })` — no resultDetail is read
    for either, exactly as before this task.'
nodes:
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: the rule's three named causes (unresolved capability, duplicate-answered concept, unregistered
    connector configuration) already reach this stage as an unavailable ObservationOutcome carrying result_detail,
    from the port and adapter the sibling task delivered; this task is what makes that detail visible
    in the record the investigation actually keeps, by copying it into Evidence.result_detail at the one
    place ObservationOutcome is turned into Evidence, instead of dropping it there as it was dropped before
    this task.
- node: rules/integration/an-http-connector-configuration-declares-its-call
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: the rule's fourth named cause (a connector configuration missing method, responseMap or statusMap,
    ending unavailable with result_detail MalformedHttpConnectorConfigurationError) reaches this stage
    the same way as the rule above's three causes — as an ObservationOutcome with result 'unavailable'
    — so the same unmodified branch carries its result_detail into the written Evidence too, with no cause-specific
    code distinguishing it from the other three. This task does not reach the configuration's own required-keys
    shape (method/responseMap/statusMap) itself, per this task's own REMAINDER note — only what the collection
    stage records once an observation has already ended unavailable for that cause.
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: Evidence's own optional result_detail attribute was already declared and already written by this
    stage's own two hand-written cases (the no-capability-registered path and this stage's own race-timeout
    path) before this task; it now also receives the port's own reported cause for an unavailable ending,
    so the value object's field is populated from the one place a cause is actually known for that ending
    rather than left absent.
- node: domain/investigation/evidence-result
  how: this task's own two criteria are organized around exactly the enumeration's four values — settledEvidence's
    branching handles 'ok' and the local TIMED_OUT marker as before, adds one branch for 'unavailable',
    and leaves 'denied' and 'timeout' falling through unchanged — honoring the enumeration's shape (only
    ok carries a usable observation; the other three are facts about the attempt) without this task adding
    a new fact of its own to the node itself.
inferences:
- inferred: the collection stage copies outcome.result_detail unconditionally for every 'unavailable'
    outcome, rather than filtering on which of the four causes produced it or requiring result_detail
    to be present.
  from: ObservationOutcome's own result_detail is optional even for a non-ok ending, and per the sibling
    task's delivery record only the four presently-unresolvable conditions ever set it today; the criteria
    name only those four causes and state nothing about a plain unavailable ending an implementer's own
    connector might answer natively. Reading whatever the port already decided to report, rather than
    adding a fifth branch or a presence check, keeps this stage from having to know the port's own vocabulary
    of causes — a fifth cause added at the port becomes visible here without this file changing, the same
    forward-compatibility the port's own doc comment already claims for observation-source.port.ts.
preserved:
- the 'ok' branch of settledEvidence — the observation string copied through, no resultDetail — unchanged.
- the 'denied' and 'timeout' branches of settledEvidence (endings observe-concept itself answers) continue
  to receive no resultDetail, exactly as before this task.
- settledEvidence's own local TIMED_OUT branch (this stage's own race-timeout mark, distinct from a 'timeout'
  ObservationOutcome) keeps its own hand-written resultDetail message ("no observation within Xms"), untouched.
- 'unavailableEvidence''s own hardcoded resultDetail for a concept no capability is currently registered
  for (capabilities.readCapability answering held: false) is untouched — a different code path from settledEvidence
  entirely, unreached by this task''s change.'
- 'every IObservationSource implementer (FakeObservationSource and any other) is unaffected: this task
  changed only how the stage reads an already-optional field off the outcome it receives, not the port''s
  own shape.'
---

## What it is

The collection stage copies the observation outcome's result detail into the evidence entry it writes for the investigation.

## Notes

None.
