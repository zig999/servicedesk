---
title: Loosened real-timer assertions cited as their own proof
summary: Cites the two already-modified assertions in diagnose-server.factory.spec.ts and anthropic-hypothesis-evaluator.adapter.spec.ts
  as what proves each criterion, since the task's entire deliverable is those two assertion edits and
  no new production or test code exists to test independently.
implementation: sha256:ded5dd38fa1882748c6f18a66a72ce85fced4a25c113631ae1b6c18d76e73b4f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/durations-total-test-threshold-too-strict-loosen-real-timer-assertions-suite-11
tests:
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
    the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
    the sum of the three stage figures since it measures the whole pipeline's own real elapsed time
  proves: Criterion 1 -- durations_total is asserted greater-than-or-equal to the stage sum rather than
    strictly greater than it. The line expect(written?.durations_total).toBeGreaterThanOrEqual((written?.durations_collection
    ?? 0) + (written?.durations_judgment ?? 0) + (written?.durations_writing ?? 0)) now admits a run where
    the whole pipeline's real elapsed time lands exactly at the stage sum, which a 1ms-resolution clock
    can genuinely produce.
  fails_when: durations_total is recorded strictly below the stage sum (collection + judgment + writing)
    on a real run -- the comparator itself only tolerates equality or excess, never a shortfall. It would
    also fail if this line were reverted to toBeGreaterThan, since a run that measures the two quantities
    as equal (the exact defect this task fixes) would then fail again.
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
    the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
    the sum of the three stage figures since it measures the whole pipeline's own real elapsed time
  proves: Criterion 2 -- the same test's other three duration assertions (durations_judgment and durations_writing
    each toBeGreaterThanOrEqual(MOCK_RESPONSE_DELAY_MS), and durations_collection toBeGreaterThan(0))
    are present, unaltered, and still hold on a real run without needing loosening.
  fails_when: durations_judgment or durations_writing is recorded below MOCK_RESPONSE_DELAY_MS (10ms),
    or durations_collection is recorded as exactly 0 or negative -- any of the three would fail independently
    of whatever durations_total does.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: reports elapsed_ms and the exact prompt sent, but never invents a usage field, when the provider
    call itself throws before any response arrives
  proves: Criterion 3 -- the elapsed_ms floor is now 14, so a measured value one millisecond below the
    mock's own nominal 15ms setTimeout-then-reject delay no longer fails the test.
  fails_when: outcome.elapsed_ms is measured at 14 while the assertion reads toBeGreaterThanOrEqual(15)
    (i.e. the floor is reverted) -- the near-miss this task exists to tolerate would fail again under
    the old floor.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: reports elapsed_ms and the exact prompt sent, but never invents a usage field, when the provider
    call itself throws before any response arrives
  proves: Criterion 4 (the elapsed_ms half) -- the loosened floor of 14 still rejects an absent or wildly
    wrong measurement against a mock that runs for 15ms.
  fails_when: outcome.elapsed_ms is undefined, null, 0, or any value below 14 -- toBeGreaterThanOrEqual(14)
    still fails on all of these, so a missing or near-instant measurement is still caught.
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
    the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
    the sum of the three stage figures since it measures the whole pipeline's own real elapsed time
  proves: Criterion 4 (the durations_total half) -- the loosened toBeGreaterThanOrEqual still rejects
    a total recorded below the stage sum, including an entirely missing measurement.
  fails_when: written?.durations_total is undefined (comparison against undefined fails toBeGreaterThanOrEqual)
    or is any numeric value strictly less than the stage sum -- a stage that never ran, or a total that
    dropped to zero while the stages did not, still fails this assertion.
not_applicable:
- edge_case: Absent or empty input to a boundary (route, DTO, request body)
  why: This task touches no boundary-input handling; it only widens two numeric comparators in real-timer
    test assertions.
- edge_case: A duplicate, or an operation against state that forbids it
  why: Neither edited assertion concerns uniqueness or state transitions; both measure elapsed time and
    a derived sum against already-persisted rows from a single, already-exercised request.
- edge_case: A dependency that fails or answers slowly
  why: The anthropic test's own scenario (provider call rejects) already is the dependency-failure case
    the task's third criterion names; no further dependency-failure edge case is introduced by loosening
    the floor.
- edge_case: Two operations against one subject at once (concurrency)
  why: Neither test exercises concurrent writes to the same investigation row; the task changes only the
    tolerance of two comparators over a single sequential run's own measurements.
- edge_case: A boundary at each end of a stated numeric range
  why: Covered directly by the five tests above -- the near-miss boundary (equality, and one-below-nominal)
    and the still-rejects-a-wildly-wrong-or-missing-value boundary.
untested:
- Criterion 5 (no file under src other than the two named test files is modified) is a claim about the
  shape of the diff, not a runtime assertion vitest can check -- verified by the implementation record's
  own files list and by git diff, not by a test.
- 'Whether the literal 14 in anthropic-hypothesis-evaluator.adapter.spec.ts constitutes a TYP-04 (named-constant)
  departure is decided_by: tool (lint) in the project''s standard -- the captured build and suite runs
  both passed lint cleanly, so no finding was raised, but this is a lint reading and not a test assertion.'
contested:
- what: 'diagnose-server.factory.spec.ts''s edited test still carries its old title fragment: ''...with
    durations_total exceeding the sum of the three stage figures since it measures the whole pipeline''s
    own real elapsed time.'' The implementation record''s own deferred entry acknowledges this overstates
    what the loosened (>=) assertion now requires, but leaves it unchanged as out of the task''s declared
    scope.'
  why: 'The task''s own criterion 1 rests on the premise that domain/investigation/durations states only
    that total is never derived as the stage sum -- not that it must exceed it. The test''s title, left
    unedited, now asserts as if factual exactly the guarantee criterion 1 says the specification does
    not make (''durations_total exceeding the sum''). This project''s own standard TST-02 (''a test is
    named for the behavior it expects, as a sentence'') points the same direction: a title that states
    a stronger guarantee than the assertion beneath it enforces is a test whose own name misleads a reader
    about what was actually proven. Scoping the edit to the one assertion expression is a defensible delivery
    boundary, but the resulting mismatch between title and assertion is a real inconsistency this proof
    record does not pass over in silence.'
---

## What it is

Proves the two loosened real-timer assertions correctly tolerate a 1ms-resolution near-miss or
equality without accepting an absent, near-zero, or otherwise wrong measurement, by citing the two
modified assertions themselves and confirming the suite passes on ten consecutive real-timer runs.

## Notes

Contested: the diagnose-server.factory.spec.ts test's own title now overstates the guarantee its
loosened assertion actually enforces -- a real inconsistency left unresolved by this task's own
declared scope.
One run of this delivery's suite (the first, uncounted toward the ten consecutive passes) failed
for a reason unrelated to this task: the shared test database's schema_migrations table still held
a row for migration 0017-evaluation-call-record.sql, applied by a sibling, still-undelivered
corrective increment's earlier suite run whose files were stashed out of the working tree for this
delivery. The orchestrating session reverted that migration's schema changes and bookkeeping row
directly against the database before re-running the suite, which then passed ten times in a row
(suite-2 through suite-11).
