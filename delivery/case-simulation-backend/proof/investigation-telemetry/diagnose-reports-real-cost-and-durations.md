---
implementation: sha256:544814490de901a006c64a3f8e02a434eca40f045339252925389e28ffe277b0
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-diagnose-reports-real-cost-and-durations-suite-3
title: Proof for diagnose reports real cost and durations
summary: Proves diagnose.controller.ts no longer references the UNMEASURED_COST/UNMEASURED_DURATIONS placeholders,
  and that run-diagnosis.ts's costOf()/durationsOf() compute cost.calls/input_tokens/output_tokens and
  durations.collection/judgment/writing/total for real, end to end through runDiagnosis().
tests:
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: no longer references UNMEASURED_COST or UNMEASURED_DURATIONS anywhere in its own source
  proves: diagnose.controller.ts no longer references UNMEASURED_COST or UNMEASURED_DURATIONS.
  fails_when: either identifier reappears anywhere in diagnose.controller.ts's own source text
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: 'proceeds exactly as before for a released-state pinned version: calls runDiagnose once with every
    field assembled unchanged, and answers with its resolved Assessment'
  proves: diagnose.controller.ts no longer references UNMEASURED_COST or UNMEASURED_DURATIONS. (the assembled
    call itself carries neither field)
  fails_when: the object handleDiagnoseRequest assembles for runDiagnose carries a cost or a durations
    property
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: counts cost.calls as one per hypothesis whose Evaluation actually carries usage, excluding a hypothesis
    that degraded to no-data without ever calling the evaluator, plus one for the consolidation call
  proves: The written investigation's cost.calls counts exactly one call per required hypothesis judged
    plus one consolidation call. / the implementation's own recorded inference that a hypothesis counts
    as judged exactly when its Evaluation carries a defined usage field, never by verdict or reason alone
  fails_when: cost.calls counts h2 (degraded to no-data, never reaching the pool) toward the total — e.g.
    answers 3 instead of 2
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: excludes a hypothesis from cost.calls when its evaluator's own answer carries no usage, even though
    evaluate() genuinely ran for it — a call this recorded cost never charges for
  proves: the same inference as above, on the sharper case where evaluate() was genuinely called but its
    own answer never carried usage at all (the exact situation the real, not-yet-widened Anthropic adapter
    is in today)
  fails_when: cost.calls counts h1 toward the total despite its Evaluation carrying no usage — e.g. answers
    2 instead of 1
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: counts cost.calls as exactly one — the consolidation call alone — when every required hypothesis
    degrades to no-data without ever calling the evaluator
  proves: The written investigation's cost.calls counts exactly one call per required hypothesis judged
    plus one consolidation call. (the zero-judged-hypotheses boundary)
  fails_when: cost.calls or cost.input_tokens/output_tokens diverge from {1, 9, 6} — the consolidation
    call's own usage alone — or evaluator.calls is nonzero
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: counts cost.calls as one per hypothesis when every required hypothesis is actually judged, plus
    one for the consolidation call
  proves: The written investigation's cost.calls counts exactly one call per required hypothesis judged
    plus one consolidation call. (the all-judged positive case)
  fails_when: cost.calls is anything other than 3 when both required hypotheses are judged and carry usage
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: sums cost.input_tokens and cost.output_tokens across every judgment call's own usage and the consolidation
    call's own usage
  proves: The written investigation's cost.input_tokens and cost.output_tokens equal the sum of every
    judgment call's own usage and the consolidation call's own usage.
  fails_when: cost.input_tokens is not 37 or cost.output_tokens is not 16 — e.g. if only one hypothesis's
    usage were summed, or the consolidation call's usage were dropped or double-counted
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: computes durations.collection and durations.judgment as the largest of their own stage's per-unit
    elapsed_ms, durations.writing as the consolidation call's own elapsed_ms, and durations.total as the
    sum of the three
  proves: The written investigation's durations carry measured, non-constant values for collection, judgment,
    writing and total... / the implementation's own recorded inferences that collection/judgment are each
    the largest of their own stage's per-unit readings (never a sum), that writing is the consolidation
    call's own elapsed_ms directly, and that total is the sum of the three
  fails_when: durations.collection is not 300 (e.g. summed to 400 instead of maxed), durations.judgment
    is not 200 (e.g. summed to 250), durations.writing is not 400, or durations.total is not 900
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: writes measured, non-constant durations across two diagnose calls whose evidence and judgment
    take different amounts of time
  proves: The written investigation's durations carry measured, non-constant values for collection, judgment,
    writing and total across two diagnose calls with different evidence/judgment timings.
  fails_when: the two calls' written durations are equal in any field — e.g. because durationsOf still
    answered a constant placeholder rather than measured values
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: writes an assessment carrying no usage, elapsed_ms or prompt, even though the wrapped consolidation
    call answered all three — capturingConsolidator captures them for cost and durations without exposing
    them through Assessment
  proves: the implementation's own recorded inference that the consolidation call's usage/elapsed_ms are
    obtained by locally wrapping the given consolidator (capturingConsolidator) rather than by changing
    draftAssessment's own signature or Assessment's own shape
  fails_when: the written assessment carries a usage, elapsed_ms or prompt property
- file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  name: persists cost.calls as the one real consolidation call and a real, non-zero collection duration,
    while judgment usage, writing and judgment duration still read zero until the Anthropic adapters themselves
    report real usage and elapsed_ms
  proves: the same criteria, over the real end-to-end HTTP/database pipeline — what the real (not-yet-widened)
    Anthropic adapters plus this task's own real costOf()/durationsOf() genuinely persist today
  fails_when: the persisted cost_calls is not 1, cost_input_tokens/cost_output_tokens are not 0, durations_collection
    is not greater than 0, durations_judgment/writing are not 0, or durations_total does not equal durations_collection
not_applicable:
- edge_case: a hypothesis whose Evaluation lacks usage because it reached deadline-exceeded or judgment-failure,
    rather than no-data or a usage-less confirmed answer
  why: costOf() branches only on whether Evaluation.usage is defined, never on the reason it is absent;
    the no-data and usage-less-confirmed paths already exercised above exercise the identical branch,
    and which upstream stage-fallback produces a usage-less Evaluation is already proven separately by
    the depended-upon widen-judgment-and-consolidation-ports task's own delivered proof (judgment-stage.spec.ts's
    own deadline-exceeded/judgment-failure tests)
- edge_case: a case requiring zero hypotheses (an empty required-hypotheses collection)
  why: no fixture in this file and no rule this task implements admits a case with zero hypotheses; aCase()'s
    own contract always names at least one, so this shape cannot reach costOf/durationsOf through runDiagnosis
    at all
- edge_case: two concurrent diagnose calls, or two concurrent judgment calls, racing each other
  why: this concurrency is already proven, unchanged by this task, by the pre-existing "bounds judgment
    concurrency..." and "refuses the second of two concurrent runs..." tests; this task only changes how
    cost/durations are computed from whatever the (unchanged) concurrent stages already produce
- edge_case: an absent or empty cost/durations shape as caller input
  why: cost and durations are no longer caller-supplied at all (criterion 1's own point) — there is no
    absent/empty-input boundary left to test
- edge_case: a duplicate call counted twice toward cost.calls
  why: no bound node or criterion claims a uniqueness constraint over cost.calls beyond "one per judged
    hypothesis plus one for consolidation," which the counting tests above already assert positively and
    by exclusion
untested:
- Whether the real Anthropic hypothesis-evaluator and assessment-consolidator adapters actually feed real,
  non-placeholder usage/elapsed_ms into costOf()/durationsOf() end to end through the real HTTP/database
  pipeline — that is task/investigation-telemetry/anthropic-adapters-report-real-usage-and-timing's own
  declared scope; every unit test above exercises run-diagnosis.ts's own aggregation logic directly with
  a scripted, non-placeholder value standing in for that adapter, and the one integration test proves
  only what today's real (still-placeholder) adapters genuinely produce.
---

## What it is

Eleven tests across three spec files, proving diagnose.controller.ts no longer references UNMEASURED_COST/UNMEASURED_DURATIONS, and that run-diagnosis.ts's costOf()/durationsOf() genuinely compute cost.calls/input_tokens/output_tokens (one call per usage-carrying Evaluation plus one for consolidation, summed usage) and durations.collection/judgment/writing/total (each stage's own real, measured maximum or direct reading, summed for total) — both at the unit level with scripted non-placeholder values, and end to end over the real HTTP/database pipeline against today's still-placeholder Anthropic adapters.

## Notes

A prior test-author pass fixed the two directly-named pre-existing test files (run-diagnosis.spec.ts, diagnose.controller.spec.ts) and wrote this task's own new proof. In doing so it surfaced a third pre-existing test — src/__tests__/integration/factories/diagnose-server.factory.spec.ts's own real end-to-end test — that this task's own change also breaks (it asserted all-zero cost/durations placeholders over the real pipeline), which the implementation record's own `deferred` section had not disclosed. A second, narrowly-scoped test-author delegation fixed that one test's own assertion to match what the real pipeline genuinely produces today (cost.calls: 1 for the always-present consolidation call, a real non-zero durations.collection, everything else still zero until the Anthropic adapters themselves are widened by the separate, not-yet-delivered anthropic-adapters-report-real-usage-and-timing task), traced through the real adapter code rather than guessed.

The suite's first two runs failed on the `test` step with an identical setup-class error (ETIMEDOUT connecting to the lab Postgres instance's own externally-provisioned database, unrelated to this task's own files, diagnosed by a failure-diagnostician subagent both times) — a genuine, transient network outage, confirmed resolved before the third run. run/investigation-telemetry-diagnose-reports-real-cost-and-durations-suite-3 is the resulting clean run.