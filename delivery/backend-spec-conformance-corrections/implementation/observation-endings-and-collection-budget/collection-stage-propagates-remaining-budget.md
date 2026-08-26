---
title: Collection stage propagates its remaining budget into observe-concept
summary: evidence-collection-stage.ts now hands its own seven-second-derived stage ceiling into observe-concept's
  remaining-budget field on its one production call site, completing the propagation the sibling task's
  port and adapter change left undone.
task: sha256:8613fe5a4daea3a1db886c4c975f340aee977c8e54b88d415b9d1f7b112ae17a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/observation-endings-and-collection-budget-collection-stage-propagates-remaining-budget-build
files:
- path: src/investigation/evidence-collection-stage.ts
  effect: collectOneEvidence's one call to observationSource.observeConcept now includes remainingBudgetMs,
    set to the stage's own stageCeilingMs (the collection stage's remaining time within its seven-second
    nominal budget, already computed once in collectEvidence and threaded down through CollectOneEvidenceOptions)
    — unchanged is the local race in raceObservation, still bounded by effectiveBoundMsFor(capability,
    stageCeilingMs), which stays this stage's own backstop against a call regardless of whether a given
    IObservationSource implementer honors the propagated bound. The JSDoc above collectOneEvidence was
    updated to say so.
criteria:
- criterion: A capability declaring a ten-second timeout, collected while the stage's seven-second budget
    is still fully available, ends at seven seconds with result timeout, unaffected by the three seconds
    its own declared timeout still had left.
  met: true
  how: stageCeilingMs is 7000ms at collection's start (COLLECTION_STAGE_BUDGET_MS, unless the propagated
    deadline leaves less), and is now the remainingBudgetMs handed to observeConcept. The already-delivered
    production adapter's effectiveTimeoutMsFor computes Math.min(capability.timeout=10000, remainingBudgetMs=7000)=7000,
    bounding its own outbound HTTP call there rather than at the capability's longer declared timeout.
    Independently, this stage's own local race (raceObservation, bounded by effectiveBoundMsFor's own
    Math.min(10000,7000)=7000, unchanged by this task) resolves TIMED_OUT at the 7000ms mark regardless
    of what the adapter does, and settledEvidence records result 'timeout' with resultDetail 'no observation
    within 7000ms' — so the ending is timeout at seven seconds either way, and the capability's own three
    unused seconds never enter it.
- criterion: The investigation proceeds after that ending rather than waiting past the seven-second collection
    budget.
  met: true
  how: raceObservation's setTimeout resolves TIMED_OUT at effectiveBoundMs — a client-side timer local
    to this stage, unaffected by whatever the adapter's own outbound call does — so collectOneEvidence
    always returns by that mark for this concept. collectEvidence's Promise.all resolves once every concept's
    own per-concept race has settled this way, so the whole stage proceeds without waiting past its seven-second
    budget for any concept, unchanged by this task's own addition of remainingBudgetMs.
nodes:
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: This task completes the rule's propagation half, left open by the sibling task observation-port-budget-clamp
    — the stage's own computed stageCeilingMs, the "ceiling the collection stage itself never exceeds,"
    now reaches observeConcept as remainingBudgetMs on the stage's one production call site, so a capability's
    own declared timeout, once clamped by the already-delivered adapter, never governs a call past what
    the stage's own seven-second budget still allows.
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: The scenario's given/when/then now holds end to end through this one call site — a capability declaring
    a longer timeout than the stage's still-available seven-second budget yields to that budget, both
    through the stage's own unchanged local race and, now that remainingBudgetMs actually reaches the
    adapter, through the outbound HTTP call itself — and the investigation proceeds via the unchanged
    Promise.all rather than waiting past it.
- node: domain/investigation/evidence-result
  how: Constrains the work without a new fact of its own reaching this task's change — 'timeout' was already
    one of settledEvidence's four endings before this task, and this task only supplies the value that
    decides when that ending fires sooner for a slow capability, not the vocabulary of endings itself.
- node: domain/investigation/evidence
  how: Constrains the work without a new fact of its own reaching this task's change — evidenceOf's assembly
    of one Evidence record (including result_detail) was already in place before this task and is unmodified;
    this task only changes what value is handed to observe-concept before that record is assembled.
- node: contracts/investigation/observation-source
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  how: The stage's own consumption of observe-concept — one call per concept, in parallel, within the
    requester's own scope — now supplies the remaining-budget bound the port already declared but this
    call site had not yet passed, completing this consumer's own use of the published operation's full
    call surface.
- node: contracts/integration/concept-observation
  how: This task changes only the caller side of the operation; the operation's own published shape (observe
    one concept for one subject, within the capability's timeout) was already widened by the sibling task
    observation-port-budget-clamp to accept a remaining-budget bound. This task supplies the value the
    operation's one production caller now actually sends.
preserved:
- collectEvidence's own stageCeilingMs computation (Math.max(0, Math.min(COLLECTION_STAGE_BUDGET_MS, deadline
  - now))) is unchanged, still computed once per collection and passed unmodified to every concept's parallel
  collectOneEvidence call.
- effectiveBoundMsFor and the local race in raceObservation are unchanged — the stage's own client-side
  timeout at the smaller of the capability's declared timeout and the stage's ceiling still governs when
  a concept's evidence is recorded as timed out, independent of whether the observationSource implementation
  given to this stage honors the newly propagated remainingBudgetMs at all.
- unavailableEvidence, evidenceOf and settledEvidence are unchanged — a concept nothing currently answers
  still never reaches the race, and the four evidence-result endings are assembled exactly as before.
- FakeObservationSource (the test-fixture IObservationSource implementer used in unit tests) still ignores
  remainingBudgetMs, as the sibling task already established — this task's addition changes what value
  collectOneEvidence sends, not what any implementer does with it.
deferred:
- what: HttpDeclarativeObservationSource's own clamping of its outbound HTTP call by remainingBudgetMs.
  why: already delivered by task/observation-endings-and-collection-budget/observation-port-budget-clamp;
    this task's own objective was only the stage's own propagation of the value into the call, named explicitly
    by that task's own Notes and its own delivery record as the REMAINDER left to this task.
---

## What it is

The collection stage computes its own remaining time within the seven-second budget and passes it into the observation port for every concept it collects.

## Notes

None.
