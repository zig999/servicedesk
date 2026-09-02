One wrong behavior observed by running the delivered test suite: while delivering the corrective
increment evaluation-call-record-lost-on-judgment-failure, its suite step was run three times in a
row (the same suite, unmodified between runs), and one integration test --
src/__tests__/integration/factories/diagnose-server.factory.spec.ts's "persists real, non-zero cost
and durations for the judgment and consolidation calls" -- failed every single time on the same
assertion, landing on EXACT equality each time at three different absolute magnitudes:

  run 1: expected 117 to be greater than 117
  run 2: expected 122 to be greater than 122
  run 3: expected 69 to be greater than 69

The assertion is `expect(written.durations_total).toBeGreaterThan(durations_collection +
durations_judgment + (durations_writing ?? 0))`.

Investigation established this is not a code defect and not ordinary timing flakiness: total and
each stage figure are all measured via readClockMs() (Date.now()), which only has 1-millisecond
resolution. The synchronous work between stages (building the subject, cross-referencing evidence
against hypotheses, resolving the outcome, computing cost) genuinely takes real time, but that time
is well under one millisecond for the small in-memory operations involved -- so it is legitimately
invisible at 1ms clock resolution, and total can legitimately compute to exactly the sum of the
per-stage figures on a fast run. domain/investigation/durations states that total is never
*derived* as the sum of collection, judgment and writing -- a statement about the computation
method, which the pipeline's implementation already honors (total is its own independent
readClockMs() difference, never constructed by adding the three stage figures together) -- but it
does not state that the resulting *value* must differ from what a sum would produce. The test's
strict `toBeGreaterThan` assertion demands a numeric guarantee the specification does not make and
the 1ms-resolution clock cannot reliably provide.

The same class of assertion appears in
src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts, whose test
"reports elapsed_ms and the exact prompt sent, but never invents a usage field, when the provider
call itself throws before any response arrives" asserts `expect(outcome.elapsed_ms).toBeGreaterThanOrEqual(15)`
against a mocked delay of the same or a similar magnitude, and failed once (14 vs >=15) during the
same three-run investigation -- the identical class of hard real-timer millisecond threshold
tripped by ordinary scheduling variance.

Both assertions were written and last touched by the already-delivered, closed initiative
durations-total-real-elapsed-hotfix. This is a corrective increment, found by running the delivered
system: the fix is to loosen these two test assertions to tolerate the legitimate equality/near-miss
a 1ms-resolution real-timer measurement can produce, not to change any production code or the
specification -- domain/investigation/durations already states what production code already does
correctly.
