---
implementation: sha256:735187c0a1713143faa6d57b26345316db872b89fe8ac7ccb31c7a687a516583
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-evidence-collection-measures-elapsed-ms-suite-3
title: Evidence carries its own collection elapsed_ms — proof
summary: Proves that evidenceOf()/EvidenceEnding supplies a real, wall-clock elapsed_ms on every branch
  it can return, that both of the tree's two Evidence construction sites (the collection stage's own evidenceOf()
  and the persistence read-path's evidenceOf(row)) carry it, and that the field survives RelationalInvestigationStore's
  own write/read round trip.
tests:
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: carries a defined, non-negative integer elapsed_ms on every Evidence item, whatever its result
    (ok, unavailable, denied, timeout)
  proves: Every Evidence item evidenceOf constructs carries an elapsed_ms integer, whatever the result
    (ok, unavailable, denied, timeout). / No Evidence item is constructed without elapsed_ms once this
    task lands.
  fails_when: any of the four endings (ok, denied, timeout, unavailable) settles with elapsed_ms undefined,
    a non-integer, or negative
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: measures elapsed_ms as exactly zero when a concept settles within the same instant its attempt
    started, rather than a positive default
  proves: elapsed_ms reflects the wall-clock time of that one concept's own collection attempt.
  fails_when: elapsed_ms is nonzero for an attempt that genuinely settles at the same instant it started
    — e.g. because a positive placeholder was used instead of a real Date.now()-based measurement
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: measures elapsed_ms as each concept's own real collection duration, distinct per concept rather
    than one value shared across the whole stage
  proves: elapsed_ms reflects the wall-clock time of that one concept's own collection attempt.
  fails_when: the fast concept's elapsed_ms is not 100 or the slow concept's is not 3000 — e.g. because
    a single stage-wide clock or the stage's own budget figure was reported instead of each concept's
    own measured duration
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: measures elapsed_ms from before the capability read for a concept nothing currently answers, since
    resolving whether anything can even be called is part of this concept's own attempt
  proves: elapsed_ms reflects the wall-clock time of that one concept's own collection attempt.
  fails_when: elapsed_ms on the unavailable ending is 0 despite the capability read itself taking 250ms
    — e.g. because attemptStartedAt were captured after the capability read rather than before it
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: measures elapsed_ms for a denied ending as the real time observe-concept itself took to answer,
    never zero and never the stage ceiling
  proves: elapsed_ms reflects the wall-clock time of that one concept's own collection attempt.
  fails_when: elapsed_ms is 0 or equals the stage's own ceiling rather than the real 1500ms observe-concept
    took to answer
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: measures elapsed_ms for an observation-reported unavailable ending as the real time observe-concept
    itself took to answer, distinct from the capability-not-held branch above
  proves: elapsed_ms reflects the wall-clock time of that one concept's own collection attempt.
  fails_when: elapsed_ms is 0 or otherwise not the real 800ms observe-concept took to answer, or is conflated
    with the capability-not-held branch's own timing
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: sends the evidence item's own elapsed_ms as the evidence insert's own last param, not silently
    dropped from the row this store persists
  proves: the implementation's own recorded inference that RelationalInvestigationStore's own evidenceStatement()/evidenceOf(row)
    needed to change to carry elapsed_ms through the write side of persistence, even though this file
    sits outside this task's own inventory node area
  fails_when: evidenceStatement() stops including elapsed_ms among the evidence insert's own params, or
    sends a value other than the given Evidence item's own
- file: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  name: assembles the stored row's own elapsed_ms into the read Evidence's own elapsed_ms, rather than
    a value carried over from another column
  proves: the same persistence-round-trip inference, on the read side — that relational-investigation-store.repository.ts's
    read-path evidenceOf(row) is a genuine second Evidence construction site this task's third criterion
    (a totality claim) also had to reach
  fails_when: evidenceOf(row) stops reading elapsed_ms from row.elapsed_ms, defaults it, or reads it from
    the wrong column
not_applicable:
- edge_case: an upper bound on elapsed_ms
  why: no criterion or bound node states a ceiling on elapsed_ms itself — it is real, unbounded wall-clock
    duration, so there is no top-end boundary for a test to assert against (the collection stage's own
    seven-second budget is a call-shaping decision this task's own header explicitly excludes elapsed_ms
    from ever influencing, not a bound on the value itself)
- edge_case: an absent or empty elapsed_ms
  why: elapsed_ms is never user input; it is always computed by the stage from Date.now() around one concept's
    own attempt, so there is no absent/empty-input boundary to trigger here — its non-optionality is what
    criterion 3 already states and the tests above exercise
- edge_case: a uniqueness violation over elapsed_ms
  why: elapsed_ms carries no declared uniqueness constraint at any layer
- edge_case: an operation attempted against state that forbids it
  why: elapsed_ms measurement gates no operation and has no state machine of its own to be attempted against
- edge_case: two concurrent collections of the same concept
  why: within one collectEvidence() call each concept is collected exactly once (rules/investigation/one-evidence-per-collected-concept,
    proven by evidence-collection-stage.spec.ts's own pre-existing tests); cross-request concurrency of
    two separate collectEvidence() calls is outside every node this task implements
untested:
- 'The compiler-enforced half of criterion 3 beyond the two construction sites this delivery''s own tree
  currently holds (evidence-collection-stage.ts''s evidenceOf() and relational-investigation-store.repository.ts''s
  read-path evidenceOf(row)): Evidence.elapsed_ms being a required, non-optional field is what would refuse
  a third, hypothetical construction site that omitted it, decided by the typecheck step (STK-01/TYP-01)
  rather than by a reading test-author writes — no runtime test can exercise a construction site that
  does not exist in the tree.'
- That investigation_evidence's new elapsed_ms column carries no DEFAULT (as opposed to NOT NULL with
  one) is not independently observable behavior distinct from the NOT NULL check src/__tests__/integration/persistence/schema-migrations.spec.ts's
  own pre-existing, untouched totality test ('holds every domain column NOT NULL except exactly the six
  columns the model declares optional') already proves by omission — that a fresh column carries no legacy
  row to backfill is an engineering fact about this delivery's own environments, not a behavior a test
  can observe.
- That the implementer's own mechanical fixes to the nine pre-existing typecheck-failing fixture files
  changed no assertion is taken from the implementation record's own account of the captured typecheck
  log, not independently re-diffed here — those files' own pre-existing tests, unchanged in what they
  assert, are what already stand as the proof that a bare literal addition was enough; writing a new test
  over a rearrangement they already exercise would prove the rearrangement rather than new behavior.
---

## What it is

Eight tests across two spec files, proving elapsed_ms is real wall-clock duration measured per concept (never a placeholder, never a stage-wide shared clock, never the stage's own ceiling) across every one of the four result branches evidence-collection-stage.ts can produce, and that the field survives RelationalInvestigationStore's own write/read round trip through the persistence layer.

## Notes

The suite's first run (run/investigation-telemetry-evidence-collection-measures-elapsed-ms-suite-2) failed one pre-existing test outside this proof's own file set: run-diagnosis.spec.ts's "forwards its own (now, deadline) pair into collection unmodified, letting a call finish just under a tight propagated deadline". A failure-diagnostician subagent diagnosed the cause as test, not code: that test relies on baseOptions()'s default consolidator, seeded via a fixture keyed on elapsed_ms: 0 (correct for this file's other, frozen-clock tests), but this one test substitutes a DelayedObservationSource(190, …) that genuinely advances the fake clock, so the evidence it produces carries the real, correct elapsed_ms: 190 — a call the shared fixture had no seed for. A fresh test-author corrected only that one test's own fixture seeding (a dedicated consolidator keyed on elapsed_ms: 190) without touching its assertion or any other test; run/investigation-telemetry-evidence-collection-measures-elapsed-ms-suite-3 is the resulting clean run.
