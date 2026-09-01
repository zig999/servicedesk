---
title: Inconclusive evaluations' citations checked against hypothesis collects
summary: judgment-stage.ts now runs the same collects-containment check over an evaluator's own inconclusive
  outcome that a confirmed or refuted outcome already receives, retrying and falling back to judgment-failure
  on the same terms.
task: sha256:03ef505ae3bfa3d19bb5d5438d0de8b7b52a069f4c96f497f2dd4ecb760f6dbe
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/inconclusive-citation-check-hotfix-inconclusive-evaluations-citations-are-checked-build-2
files:
- path: src/investigation/judgment-stage.ts
  effect: runIsolatedCall() and retryOrFail() no longer short-circuit an evaluator's own inconclusive
    outcome past the citation check before building HypothesisCitationContext; both now route every outcome
    verdict through the new citationsAreAcceptable() before deciding to accept it, retry, or fall back to
    judgment-failure. citationsAreAcceptable() treats an inconclusive outcome carrying zero citations as
    acceptable without invoking the containment check (there is nothing to check), and otherwise delegates
    to the pre-existing isStructurallyValid() -- unchanged -- for confirmed, refuted, and cited-inconclusive
    outcomes alike. The locally synthesized noDataEvaluation(), deadlineExceededEvaluation() and judgmentFailureEvaluation()
    paths, which never reach the evaluator at all, are untouched.
criteria:
- criterion: Where an evaluator's own outcome answers with verdict inconclusive and one or more citations,
    each citation is checked against the judged hypothesis-revision's own collects
    (rules/investigation/a-citation-stays-within-the-hypothesis-collects) before the evaluation is
    recorded — the check is never skipped merely because the verdict is not confirmed or refuted.
  met: true
  how: Both call sites in judgment-stage.ts (the first call in runIsolatedCall() and the retry in
    retryOrFail()) now call citationsAreAcceptable(context, outcome) before asEvaluation() is ever reached,
    for every verdict the evaluator itself returns. citationsAreAcceptable() only exempts an inconclusive
    outcome when its own citations array is empty; a cited inconclusive outcome falls through to
    isStructurallyValid(), the same containment check confirmed and refuted citations already receive.
- criterion: Where an inconclusive outcome's citations fail that check, the outcome is answered the same way
    a confirmed or refuted outcome that fails the check already is (the existing retry, and
    judgment-failure where the retry also fails or the deadline admits none) — never recorded with
    an out-of-collects citation as if it had passed.
  met: true
  how: A failing citationsAreAcceptable() on the first call routes to the unchanged retryOrFail(), which
    still returns judgmentFailureEvaluation() immediately if the deadline has elapsed, and otherwise issues
    the retry call. citationsAreAcceptable() is applied identically to the retry outcome; a still-failing
    inconclusive retry now falls back to judgmentFailureEvaluation() the same way a still-failing confirmed
    or refuted retry already did -- no branch remains that returns an inconclusive outcome carrying a
    foreign citation.
- criterion: This fix changes nothing about which citations an inconclusive evaluation carries or their shape
    — including a no-data reason's own field-absent citations, whose collects-containment holds by
    construction (drawn from evidence already collected for the same hypothesis-revision) rather
    than by the checked-response remedy this task adds — it only adds the same containment check
    confirmed and refuted citations already receive to an outcome an evaluator actually returned.
  met: true
  how: noDataEvaluation() is untouched -- judgeOneHypothesis() still short-circuits to it before the
    evaluator is ever called whenever non-ok evidence exists, so its synthesized field-absent citations
    never pass through citationsAreAcceptable() or isStructurallyValid() at all. The new check is reached
    only from runIsolatedCall() and retryOrFail(), which exist solely to route an outcome the evaluator
    itself returned; asEvaluation() and callRecordOf() -- which shape every recorded citation array -- are
    unmodified.
nodes:
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: The rule states the containment holds over every evaluation an evaluator produced, and holds by
    construction (not by a checked response) only for a no-data evaluation, whose citations never reach an
    evaluator call. citationsAreAcceptable() in judgment-stage.ts now applies isStructurallyValid() -- which
    checks citesACollectedConcept and citesADeclaredField from citation-validation.ts, unmodified -- to
    every cited outcome the evaluator itself returns, confirmed, refuted or inconclusive alike, while
    leaving the no-data, deadline-exceeded and judgment-failure synthesized evaluations (none of which came
    from an evaluator call) outside that check, exactly as the rule's own text now distinguishes.
- node: scenarios/investigation/a-foreign-citation-is-refused
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: The scenario's remedy -- refuse, retry once if the deadline admits it, else fall back to
    inconclusive judgment-failure -- was already implemented for a confirmed or refuted response and is now
    reached for an inconclusive one too -- a first-call inconclusive outcome whose citations fail
    citationsAreAcceptable() now falls into the same retryOrFail() path a confirmed or refuted failure
    already used, and a still-failing inconclusive retry now falls back to judgmentFailureEvaluation() the
    same way a still-failing confirmed or refuted retry already did.
inferences:
- inferred: An evaluator-returned inconclusive outcome carrying zero citations is accepted without running
    the containment check at all, rather than being treated as a check failure that forces a retry.
  from: the task's own first criterion, which scopes the added check to an inconclusive outcome carrying
    "one or more citations" -- there is nothing to check against the collects when the outcome cites
    nothing, and the pre-existing isStructurallyValid() would otherwise have treated zero citations as an
    automatic failure (a defensive floor written for confirmed and refuted, whose type guarantees at least
    one citation), forcing an unwanted retry on the ordinary case of an inconclusive answer that cites
    nothing -- a behavior no criterion, node or existing passing test of this stage calls for.
preserved:
- the pool-slot concurrency and per-hypothesis retry-holds-its-own-slot behavior in CallPool and
  acquireSlotOrDeadline, untouched by this change
- the deadline-guard race between an in-flight evaluate() call and the stage's own deadline, including
  deadlineExceededEvaluation() for both an unstarted and an in-flight call
- the no-data short-circuit in judgeOneHypothesis(), which still never calls the evaluator and still
  synthesizes field-absent citations by construction from non-ok evidence
- the existing citation-structural-validity check (isStructurallyValid(), citesACollectedConcept and
  citesADeclaredField in citation-validation.ts) for a confirmed or refuted outcome, called exactly as
  before through the new citationsAreAcceptable() wrapper
- asEvaluation() and callRecordOf(), which still shape the recorded Evaluation's citations, usage,
  elapsed_ms and prompt fields unchanged for every verdict
deferred:
- what: src/__tests__/unit/investigation/judgment-stage.spec.ts holds two existing tests -- "passes an
    inconclusive first answer through unchanged, with no retry attempted" and "passes an inconclusive retry
    answer through unchanged" -- that script the evaluator to return an inconclusive outcome citing a
    concept the case's declared fields do not carry, and assert it is recorded unchanged with no retry.
    Under the fix, both citations now fail citationsAreAcceptable() and are answered as this task's own
    second criterion requires (retried, then judgment-failure), so both assertions no longer hold against
    the corrected source.
  why: writing or editing a test file is the test-author's judgment, not the task-implementer's; this
    delivery is scoped to judgment-stage.ts alone, and the task's own criteria are what the corrected
    assertions must be checked against.
---

## What it is

The corrective fix holding an inconclusive evaluation's own citations to the same
hypothesis-collects containment check judgment-stage.ts already runs for a confirmed or refuted
evaluation, instead of returning them unchecked -- scoped to an outcome an evaluator actually
returned, since a no-data evaluation's citations are synthesized and hold the containment by
construction (rules/investigation/a-citation-stays-within-the-hypothesis-collects, amended).

## Notes

None.
