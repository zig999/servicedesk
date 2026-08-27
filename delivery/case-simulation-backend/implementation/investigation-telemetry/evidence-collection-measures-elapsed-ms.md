---
title: Evidence carries its own collection elapsed_ms
summary: evidence-collection-stage.ts's evidenceOf()/EvidenceEnding machinery measures and supplies elapsed_ms
  on every branch, Evidence.elapsed_ms is now a required field, and its one persistence round-trip (migration,
  insert, select, row shape) and every pre-existing consumer/fixture were brought into line so the project
  builds.
task: sha256:f2de6de44bdb632890fdc4cc18639f3876a4958cfffbf81d8be8ba6e8dcd00bd
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-evidence-collection-measures-elapsed-ms-build-3
files:
- path: src/investigation/evidence.ts
  effect: Evidence gains a required elapsed_ms:number attribute (domain/investigation/evidence), documented
    as "how long this one concept's own collection attempt took, in milliseconds, whatever the result."
- path: src/investigation/evidence-collection-stage.ts
  effect: EvidenceEnding gains a required elapsedMs; evidenceOf() carries it onto every constructed Evidence;
    unavailableEvidence and settledEvidence each time their own ending from a newly captured attemptStartedAt
    (Date.now() before the capability read) to the moment that ending is determined (Date.now() again),
    on every branch (unavailable, ok, denied, timeout) — real wall-clock time, no part of any deadline/budget
    decision.
- path: migrations/0011-investigation-evidence-elapsed-ms.sql
  effect: 'new file — ALTER TABLE investigation_evidence ADD COLUMN elapsed_ms INTEGER NOT NULL, with
    no DEFAULT: a fresh column on a table this delivery finds holding no pre-existing rows in any environment
    it runs against.'
- path: src/persistence/relational-investigation-store.repository.ts
  effect: IEvidenceRow gains elapsed_ms:number; evidenceStatement()'s INSERT and its params array now
    carry evidence.elapsed_ms as a twelfth column/parameter; the SELECT in readEvidence() now reads elapsed_ms;
    evidenceOf(row) now carries row.elapsed_ms straight into the assembled Evidence — so both the write
    and the read side of investigation_evidence round-trip the field.
- path: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  effect: anIntegrationEvidence() now supplies elapsed_ms:12 — mechanical fixture fix, every downstream
    assertion spreads this same object so nothing else changed.
- path: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  effect: evidenceRow() and anEvidence() (the row-side and document-side fixtures the file itself says
    are meant to match) both now supply elapsed_ms:12; the exact evidence-insert params array assertion
    now includes 12 as its twelfth element — mechanical fixture fix, no assertion's meaning changed.
- path: src/__tests__/unit/investigation/anthropic-assessment-consolidator.adapter.spec.ts
  effect: SOME_EVIDENCE's one literal now carries elapsed_ms:12 — mechanical fixture fix.
- path: src/__tests__/unit/investigation/assessment-consolidator.port.spec.ts
  effect: SOME_EVIDENCE's one literal now carries elapsed_ms:12 — mechanical fixture fix.
- path: src/__tests__/unit/investigation/citation-validation.spec.ts
  effect: anEvidence()'s default object now carries elapsed_ms:12 ahead of ...overrides — mechanical fixture
    fix.
- path: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  effect: anEvidence()'s default object now carries elapsed_ms:12 ahead of ...overrides — mechanical fixture
    fix.
- path: src/__tests__/unit/investigation/investigation-factory.spec.ts
  effect: anEvidence()'s default object now carries elapsed_ms:12 ahead of ...overrides — mechanical fixture
    fix.
- path: src/__tests__/unit/investigation/judgment-stage.spec.ts
  effect: anEvidence()'s default object now carries elapsed_ms:12 ahead of ...overrides — mechanical fixture
    fix.
- path: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  effect: anEvidence()'s default object now carries elapsed_ms:12 ahead of ...overrides — mechanical fixture
    fix.
- path: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  effect: expectedOkEvidence() now carries elapsed_ms:0 — the value the actual pipeline produces under
    this file's own vi.useFakeTimers() discipline, since every place this helper is used resolves the
    ok branch on microtasks alone with no timer advance between attemptStartedAt and settling, so Date.now()
    reads the same frozen instant twice.
- path: src/__tests__/integration/persistence/schema-migrations.spec.ts
  effect: insertEvidence()'s raw INSERT now names elapsed_ms in its column list and supplies the literal
    12 in VALUES — a third, non-typecheck-visible consequence of the same NOT NULL column (untyped SQL
    text), fixed the same mechanical way so this integration test's direct write against investigation_evidence
    still succeeds.
criteria:
- criterion: Every Evidence item evidenceOf constructs carries an elapsed_ms integer, whatever the result
    (ok, unavailable, denied, timeout).
  met: true
  how: EvidenceEnding.elapsedMs is required (not optional); unavailableEvidence and settledEvidence build
    every one of the four endings (unavailable, ok, denied, timeout) with an explicit elapsedMs, and evidenceOf()
    copies it straight onto the assembled Evidence's elapsed_ms on every call.
- criterion: elapsed_ms reflects the wall-clock time of that one concept's own collection attempt.
  met: true
  how: collectOneEvidence captures attemptStartedAt = Date.now() before the capability read (the earliest
    point of this concept's own attempt); elapsedSince(attemptStartedAt) = Date.now() - attemptStartedAt
    is read at each of the three points an ending is determined (the capability-unresolved return, and
    the two branches settledEvidence covers — the race timeout and observe-concept's own answer) — real
    wall-clock duration, untouched by and no part of the deadline/budget computation.
- criterion: No Evidence item is constructed without elapsed_ms once this task lands.
  met: true
  how: Evidence.elapsed_ms is now a required (non-optional) field of the type, enforced by the compiler
    at every construction site; the only other place in this delivery that constructs an Evidence — relational-investigation-store.repository.ts's
    read-path evidenceOf(row) — was brought into the same round trip by 0011-investigation-evidence-elapsed-ms.sql
    and the repository's own updated INSERT/SELECT, so no construction path in the tree can omit it and
    still compile.
nodes:
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/evidence.ts
  - src/investigation/evidence-collection-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
  - migrations/0011-investigation-evidence-elapsed-ms.sql
  how: elapsed_ms is declared as the node's own required integer attribute in evidence.ts, assembled on
    every branch by evidence-collection-stage.ts's evidenceOf(), and carried whole through this evidence
    item's one persistence path — its INSERT, its SELECT and its row shape — so the value the node declares
    is never dropped between being measured and being read back.
inferences:
- inferred: relational-investigation-store.repository.ts's own IEvidenceRow/evidenceStatement/evidenceOf
    and a new migration (0011-investigation-evidence-elapsed-ms.sql) needed to change, even though this
    file sits outside this task's own inventory node area and this task's own criteria name only evidence-collection-stage.ts.
  from: this task's own third criterion is a totality claim over every Evidence construction, and relational-investigation-store.repository.ts's
    own read-path evidenceOf(row) is a genuine second construction site; the captured typecheck failure
    named it directly. Followed the same discipline delivery/backend-spec-conformance-corrections/implementation/connector-configuration-registration-conformance/configuration-held-as-text.md
    recorded for the identical situation (a required-field type change propagated into a persistence file
    its own task also did not name), disclosing it here as an inference rather than a criterion this task's
    own text states.
- inferred: investigation_evidence's new elapsed_ms column is a plain NOT NULL with no DEFAULT and no
    backfill value for any legacy row.
  from: 'no specification node states what value a pre-migration row''s elapsed_ms should read as, and
    this delivery finds the table holding no pre-existing rows in any environment it runs against — nothing
    to backfill. The same category the inventory''s own Notes already name for the release-gate error''s
    status code: an engineering shape carrying no business fact, not a fact needing specification backing.'
- inferred: the nine pre-existing test/fixture files the typecheck log named needed only a mechanical
    construction/read-shape fix — a literal elapsed_ms added to a shared helper's default object, ahead
    of ...overrides where one is used — never a change to what any of them assert.
  from: every one of the ten typecheck errors was "Property elapsed_ms is missing/incompatible" against
    a plain object literal or a Partial<Evidence>-typed helper; none named an assertion. Same discipline
    delivery/backend-spec-conformance-corrections/implementation/connector-configuration-registration-conformance/configuration-held-as-text.md's
    own Notes recorded for its own second build pass over ten comparable files.
- inferred: run-diagnosis.spec.ts's expectedOkEvidence() needed elapsed_ms:0 specifically, not an arbitrary
    placeholder like the other eleven fixtures' 12, because this file's own consolidator fixtures (FakeAssessmentConsolidator)
    key their seeded answer on JSON.stringify of the whole evaluations/evidence/register call, so the
    literal has to match what collectEvidence actually produces at runtime, not just typecheck.
  from: this file's own header states every stage races under vi.useFakeTimers() with no macrotask; every
    place expectedOkEvidence() is used resolves the ok branch through FakeCapabilityQuery/FakeObservationSource's
    own already-resolved promises with no vi.advanceTimersByTimeAsync call between the pipeline starting
    and that branch settling, so evidence-collection-stage.ts's own attemptStartedAt and elapsedSince
    Date.now() calls read the identical frozen fake-clock instant, giving elapsed_ms = 0 on that path.
- inferred: schema-migrations.spec.ts's insertEvidence() raw-SQL helper needed the same mechanical fix
    (elapsed_ms named in the column list, a literal 12 in VALUES), even though it was not named in the
    captured typecheck log.
  from: this helper issues a raw parameterized INSERT into investigation_evidence as an untyped SQL string,
    which tsc cannot see; but it is a genuine third consequence of the same NOT NULL column this task's
    own migration adds, and would fail this integration suite's own real-database write at runtime otherwise
    — the same mechanical class of fix as the typecheck-visible ones, just invisible to the tool that
    caught the others.
preserved:
- The deadline/budget race logic, the collection stage's own seven-second-budget-vs-propagated-deadline
  computation, and every other timing decision in evidence-collection-stage.ts — untouched this pass;
  already delivered sound by the prior instance and not reopened.
- RelationalInvestigationStore's write-once/transactional semantics, its InvestigationAlreadyStoredError/InvestigationStoreError
  mapping, and every other column of every other table it reads or writes — untouched; only investigation_evidence's
  own column list widened by exactly one field on both the write and the read side.
- Every fixed test file's own assertions, expected values, refusal conditions and coverage — unchanged;
  every edit was a construction-site or raw-INSERT addition of one field, never a comparison.
- schema-migrations.spec.ts's replay test (EXPECTED_TABLES), its nullable-columns totality check, its
  enumeration-value checks and its uniqueness checks — untouched; the fix touches only insertEvidence()'s
  own INSERT text and VALUES.
---

## What it is

evidence-collection-stage.ts's evidenceOf()/EvidenceEnding machinery measures how long each concept's own collection attempt took, in real wall-clock milliseconds, and supplies it on every Evidence it assembles (ok, unavailable, denied, timeout). Evidence.elapsed_ms is now a required attribute, and its one persistence path — a new migration, the INSERT and the SELECT in relational-investigation-store.repository.ts — carries the value whole between being measured and being read back, so no construction site in the tree can omit it and still compile.

## Notes

The first captured build (run/investigation-telemetry-evidence-collection-measures-elapsed-ms-build) failed typecheck: relational-investigation-store.repository.ts's read-path evidenceOf(row) could not satisfy the widened Evidence type, and ten pre-existing test/fixture files constructed Evidence literals without elapsed_ms. Both were direct, mechanical consequences of Evidence.elapsed_ms becoming required rather than new behavior, and both were fixed in a second pass — the persistence round trip gained a real migration and updated statements, the fixtures gained a literal value with no assertion changed — following the precedent delivery/backend-spec-conformance-corrections/implementation/connector-configuration-registration-conformance/configuration-held-as-text.md recorded for the identical situation. The build passed on run/investigation-telemetry-evidence-collection-measures-elapsed-ms-build-2.
