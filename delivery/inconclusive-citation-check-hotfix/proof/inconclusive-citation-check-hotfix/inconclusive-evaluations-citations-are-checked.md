---
implementation: sha256:6df182a387ed1ddd9626a7757ec1d652185d3679fdbac80680ad400504e20065
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/inconclusive-citation-check-hotfix-inconclusive-evaluations-citations-are-checked-suite
title: Inconclusive citation check hotfix — proof
summary: Corrects two judgment-stage.spec.ts tests whose assertions asserted the pre-fix behavior, adds
  five tests proving the task's three criteria, and adds the missing register field to a
  run-diagnosis.spec.ts fixture that was the sole blocker of npm run typecheck.
tests:
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: retries an inconclusive first answer whose citation fails the collects-containment check, and falls
    back to judgment-failure when the retry citation fails it too
  proves: Where an inconclusive outcome's citations fail that check, the outcome is answered the same way
    a confirmed or refuted outcome that fails the check already is (the existing retry, and
    judgment-failure where the retry also fails or the deadline admits none) — never recorded with
    an out-of-collects citation as if it had passed.
  fails_when: judgment-stage.ts stops checking an inconclusive first answer's citation against the
    hypothesis-revision's collects (reverting to the pre-fix short-circuit) -- the original citation to the
    undeclared field would then be returned unchanged with only one evaluator call, instead of a retry
    followed by judgment-failure with empty citations.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: falls back to inconclusive judgment-failure when the retry's own inconclusive answer carries a
    citation that fails the collects-containment check too
  proves: Where an inconclusive outcome's citations fail that check, the outcome is answered the same way
    a confirmed or refuted outcome that fails the check already is (the existing retry, and
    judgment-failure where the retry also fails or the deadline admits none) — never recorded with
    an out-of-collects citation as if it had passed.
  fails_when: the retry's own inconclusive answer stops being checked before being accepted -- the citation
    to the undeclared field would then be returned as the recorded evaluation's reason 'no-data' with that
    citation, instead of judgment-failure with empty citations.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: checks an inconclusive first answer's own citation against the hypothesis-revision's own collects,
    retrying when the cited concept falls outside them — the check is never skipped merely because
    the verdict is not confirmed or refuted
  proves: Where an evaluator's own outcome answers with verdict inconclusive and one or more citations,
    each citation is checked against the judged hypothesis-revision's own collects
    (rules/investigation/a-citation-stays-within-the-hypothesis-collects) before the evaluation is
    recorded — the check is never skipped merely because the verdict is not confirmed or refuted.
  fails_when: judgment-stage.ts short-circuits an inconclusive outcome past citationsAreAcceptable() because
    its verdict isn't confirmed or refuted -- the first answer's out-of-collects citation would then be
    returned unchanged with only one evaluator call, instead of triggering a retry whose own valid citation
    is what gets recorded.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: never records an inconclusive outcome carrying an out-of-collects citation as if it had passed — a
    first answer and its retry both citing a concept outside the collects fall back to judgment-failure
  proves: Where an inconclusive outcome's citations fail that check, the outcome is answered the same way
    a confirmed or refuted outcome that fails the check already is (the existing retry, and
    judgment-failure where the retry also fails or the deadline admits none) — never recorded with
    an out-of-collects citation as if it had passed.
  fails_when: an inconclusive outcome whose citation names a concept outside the hypothesis's collects is
    ever recorded as-is instead of retried and, on a second failure, replaced by judgment-failure -- the
    foreign citation would then appear in the result instead of an empty citations array.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: records inconclusive no-data citing every non-ok evidence item, and never enters the pool for that
    hypothesis
  proves: This fix changes nothing about which citations an inconclusive evaluation carries or their shape
    — including a no-data reason's own field-absent citations, whose collects-containment holds by
    construction (drawn from evidence already collected for the same hypothesis-revision) rather
    than by the checked-response remedy this task adds — it only adds the same containment check
    confirmed and refuted citations already receive to an outcome an evaluator actually returned.
  fails_when: noDataEvaluation()'s synthesized field-absent citations are routed through
    citationsAreAcceptable()/isStructurallyValid(), or the evaluator is invoked at all for a hypothesis
    with non-ok evidence -- the field-absent citations (which no declared field matches) would then be
    rejected or the evaluator.calls count would rise above zero, instead of the synthesized citations being
    recorded unchecked as before this task.
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: attaches the usage, elapsed_ms and prompt a first call's own inconclusive answer returned, passed
    through unchanged
  proves: the implementation's own recorded inference -- an evaluator-returned inconclusive outcome
    carrying zero citations is accepted without running the containment check at all, rather than being
    treated as a check failure that forces a retry.
  fails_when: an inconclusive outcome carrying zero citations is treated as a check failure that forces a
    retry -- the test's single scripted answer would be exhausted by a second evaluate() call and the
    ScriptedHypothesisEvaluator would throw "no answer scripted", failing the test instead of returning the
    passed-through result with its usage, elapsed_ms and prompt attached.
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: computes persistence's own bound from the actual wall-clock time elapsed before persistence begins,
    never from durations.collection + durations.judgment + durations.writing — a write still proceeds
    even where those reported durations would sum to more than the whole deadline
  proves: the ScriptedAssessmentConsolidator fixture construction type-checks against ConsolidationOutcome,
    whose register field has been required since consolidation-call-record-chain-hotfix -- unrelated to
    this task's own criteria, but the sole blocker of npm run typecheck for the whole target.
  fails_when: the object literal at this test's own consolidator construction stops carrying register --
    npm run typecheck fails on this file, exactly as it did before this one-line addition.
not_applicable:
- edge_case: two or more hypotheses judged concurrently, each carrying an inconclusive citation that fails
    the containment check at the same time
  why: the CallPool/deadlineGuard concurrency machinery is unchanged by this task (per the implementation's
    own preserved list) and is already exercised by pre-existing pool tests using confirmed outcomes;
    citationsAreAcceptable() is a pure, per-outcome, synchronous check that runs identically regardless of
    how many hypotheses are in flight, so concurrency raises no scenario this task's change could behave
    differently under.
untested:
- "retryOrFail()'s own pre-existing deadlineGuard.elapsed() short-circuit -- returning judgment-failure
  without attempting a second evaluate() call once the deadline has already elapsed by the time a first
  citation-check failure is reached -- and the retry's own DEADLINE_ELAPSED race (returning
  deadline-exceeded instead of judgment-failure) are both now reachable from an inconclusive first answer
  exactly as they already were from a confirmed or refuted one, but neither branch has a dedicated test
  for any verdict, before or after this task -- both are pre-existing, verdict-agnostic branches of
  retryOrFail this task's own change does not touch, and this proof adds none -- a deterministic
  fake-timer test isolating the elapsed()-at-entry branch from the DEADLINE_ELAPSED race that already
  precedes it would be exercising retryOrFail's own timing plumbing rather than this task's
  citation-check addition."
---

## What it is

The proof for the inconclusive-citation-check-hotfix: judgment-stage.ts's collects-containment
check now runs over an evaluator-returned inconclusive outcome's own citations too, not only over
a confirmed or refuted outcome's.

## Notes

Two pre-existing judgment-stage.spec.ts tests asserted the pre-fix short-circuit (an inconclusive
outcome's out-of-collects citation passed through unchecked); both were diagnosed cause `test` and
corrected to expect the retry-then-judgment-failure remedy this task's own second criterion
requires. One unrelated pre-existing typecheck blocker in run-diagnosis.spec.ts (a
ScriptedAssessmentConsolidator fixture missing the register field required since
consolidation-call-record-chain-hotfix) was also fixed, mechanically matching every sibling
construction in the same file.
