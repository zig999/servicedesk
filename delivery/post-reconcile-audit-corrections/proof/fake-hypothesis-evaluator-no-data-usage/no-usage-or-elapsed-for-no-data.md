---
target: backend
title: Fake hypothesis-evaluator no-data usage/elapsed_ms/prompt withholding
summary: Proves the no-data guard withholds usage, elapsed_ms and prompt as criterion 1 and both UNDERDETERMINED
  entries state, and updates the seven pre-existing tests the same file already carried so they match
  the now-widened invariant that every non-no-data outcome also carries a prompt.
implementation: sha256:eee8d47bc3ee11f9fe1d5b5b9a0b10e7715948f04c146175ffc1dddc50584095
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/fake-hypothesis-evaluator-no-data-usage-no-usage-or-elapsed-for-no-data-suite-2
tests:
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: withholds usage and elapsed_ms from an outcome seeded with reason no-data and no usage or elapsed_ms
    of its own
  proves: 'Criterion: Calling evaluate() against a seed whose reason is no-data and which carries no usage
    or elapsed_ms of its own answers an outcome carrying no usage and no elapsed_ms.'
  fails_when: evaluate() merges the fake's placeholder usage and/or elapsed_ms onto a no-data-reasoned
    outcome instead of returning it without those fields.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: strips a no-data outcome down to no usage, elapsed_ms or prompt even where the seed itself already
    carried them, since a no-data outcome means judgment was never called at all
  proves: UNDERDETERMINED, from the specification -- neither criterion covers a no-data seed that already
    carries its own usage, elapsed_ms or prompt; domain/investigation/evaluation refuses those fields
    on a no-data outcome regardless of whether the seed supplied them.
  fails_when: evaluate() returns a no-data-reasoned seed's own usage, elapsed_ms or prompt unstripped
    instead of withholding all three regardless of what the seed carried.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: adds a placeholder prompt alongside the placeholder usage and elapsed_ms for a non-no-data seed
    that carries no prompt of its own
  proves: UNDERDETERMINED, from the specification -- domain/investigation/evaluation lists prompt alongside
    usage and elapsed_ms as present exactly when a call happened; no criterion here names prompt, and
    the adapter adds none.
  fails_when: evaluate() answers a non-no-data outcome whose seed carried no prompt of its own without
    adding one.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers the confirmed verdict with exactly the citations seeded for it, plus the deterministic
    zero-valued usage and elapsed_ms every answer now carries
  proves: 'Criterion: Calling evaluate() against a seed whose reason is not no-data and which carries
    no usage or elapsed_ms of its own still answers an outcome carrying the fake''s own placeholder usage
    and elapsed_ms -- the representative case for this obligation, using a confirmed verdict -- and, incidentally
    to the widened invariant, that the placeholder prompt is now also present.'
  fails_when: evaluate() fails to merge ZEROED_USAGE, ZEROED_ELAPSED_MS or the placeholder prompt onto
    a confirmed outcome whose seed supplied none of its own.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers the refuted verdict with exactly the citations seeded for it, plus the deterministic zero-valued
    usage and elapsed_ms every answer now carries
  proves: The same criterion-2 class as the confirmed-verdict test above, for a refuted verdict; pre-existing
    regression coverage kept unmodified in substance and updated only for the widened prompt.
  fails_when: evaluate() fails to merge ZEROED_USAGE, ZEROED_ELAPSED_MS or the placeholder prompt onto
    a refuted outcome whose seed supplied none of its own.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers the inconclusive verdict with exactly the reason seeded for it, judgment-failure carrying
    no citations, plus the deterministic zero-valued usage and elapsed_ms every answer now carries
  proves: The same criterion-2 class, now for an inconclusive/judgment-failure seed; pre-existing regression
    coverage, not independently required beyond the confirmed-verdict representative.
  fails_when: evaluate() fails to merge ZEROED_USAGE, ZEROED_ELAPSED_MS or the placeholder prompt onto
    a judgment-failure outcome whose seed supplied none of its own.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers by criterion alone, ignoring the evidence a call carries, even when the evidence array
    is empty
  proves: The same criterion-2 class, combined with the pre-existing fact that evaluate() ignores its
    evidence argument; pre-existing regression coverage, updated only for the widened prompt.
  fails_when: evaluate() fails to merge ZEROED_USAGE, ZEROED_ELAPSED_MS or the placeholder prompt onto
    the seeded outcome when called with empty evidence.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: answers the outcome seeded for this criterion, not the one seeded for a different criterion, plus
    the deterministic zero-valued usage and elapsed_ms every answer now carries
  proves: The same criterion-2 class, combined with the pre-existing fixture-selection-by-criterion behavior;
    pre-existing regression coverage, updated only for the widened prompt.
  fails_when: evaluate() fails to merge ZEROED_USAGE, ZEROED_ELAPSED_MS or the placeholder prompt onto
    the outcome seeded for the requested criterion, or answers the wrong fixture.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: overrides a seeded non-zero usage and elapsed_ms with the deterministic zero on every answer,
    while still carrying a seeded prompt through unchanged
  proves: The other half of the widened invariant left untouched by this exchange -- a non-no-data seed's
    own prompt is never replaced by the placeholder, only ever supplied when the seed carried none.
  fails_when: evaluate() overwrites a seed's own prompt with PLACEHOLDER_PROMPT instead of leaving it
    as seeded.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: attaches the deterministic zero-valued usage and elapsed_ms plus the placeholder prompt where
    a seeded outcome carries no prompt of its own
  proves: The same input and outcome as the confirmed-verdict test above; renamed and rewritten from its
    prior absent-prompt title, kept because it predates this delivery and was not to be deleted.
  fails_when: evaluate() fails to merge ZEROED_USAGE, ZEROED_ELAPSED_MS or the placeholder prompt onto
    a confirmed outcome whose seed supplied none of its own.
- file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  name: a later seed for the same criterion replaces the earlier one, plus the deterministic zero-valued
    usage and elapsed_ms every answer now carries
  proves: The same criterion-2 class, combined with the pre-existing later-seed-replaces-earlier behavior;
    pre-existing regression coverage, updated only for the widened prompt.
  fails_when: evaluate() fails to merge ZEROED_USAGE, ZEROED_ELAPSED_MS or the placeholder prompt onto
    the replacing seed's outcome, or answers the replaced one.
not_applicable:
- edge_case: Absent or empty input to evaluate() (criterion, evidence, case context)
  why: This task's obligations concern only whether a seeded outcome's usage, elapsed_ms and prompt survive
    or are withheld; the unseeded-criterion refusal and the ignored-evidence behavior are pre-existing
    behavior with their own pre-existing tests, not this task's criteria or node.
- edge_case: A boundary at each end of a numeric range
  why: Neither criterion nor the node's fact bounds usage or elapsed_ms by a range; the fields are attached
    or withheld as a whole, never incremented across a threshold.
- edge_case: An empty collection where one comes back
  why: An empty citations array is orthogonal to whether usage, elapsed_ms and prompt are attached; it
    is already exercised by pre-existing tests unrelated to this fix.
- edge_case: A duplicate where uniqueness is claimed
  why: Neither this task's criteria nor domain/investigation/evaluation claims a uniqueness constraint.
- edge_case: An operation against state that forbids it
  why: The only forbidden-state path (evaluating an unseeded criterion) is pre-existing and untouched
    by this task's guard.
- edge_case: A dependency that fails or answers slowly
  why: FakeHypothesisEvaluator is itself the stand-in and has no dependency of its own to fail or slow
    down.
- edge_case: Two operations against one subject at once
  why: No criterion or node fact here claims any concurrency behavior for evaluate().
untested:
- 'domain/investigation/evaluation: within the fake, both halves of its fact now hold -- the no-data branch
  withholds usage, elapsed_ms and prompt whole (proven by the entry-1 test, which strips even a seed that
  already supplied all three), and the non-no-data branch attaches all three whole (proven by the confirmed-verdict
  test, using a seed supplying none of its own) -- but no single test asserts the fact''s full biconditional
  across both branches at once without conflating two independent failure reasons into one assertion,
  and the fact as the node states it governs every producer of an EvaluationOutcome, not only fake-hypothesis-evaluator.adapter.ts,
  which is the only file this task''s implements and encoded_at reach; anthropic-hypothesis-evaluator.adapter.ts
  is untouched by this task and its own conformance to the same fact is not decided here.'
divergences:
- cites: TST-04
  file: src/__tests__/unit/investigation/hypothesis-evaluator.port.spec.ts
  departure: Tests for fake-hypothesis-evaluator.adapter.ts's no-data guard and placeholder-prompt behavior
    sit in hypothesis-evaluator.port.spec.ts rather than in a fake-hypothesis-evaluator.adapter.spec.ts
    mirroring the changed file's own name.
  why: Every existing test of the fake -- including the ones the implementation record marked preserved
    and the pre-existing no-data test -- already lives in this one file, which this project uses to exercise
    every implementer of IHypothesisEvaluator's port contract together; splitting the new and rewritten
    cases into a second file would separate them from the sibling cases they must be read against, without
    correcting the mismatch TST-04 would still find in the file this project already keeps them in.
---

## What it is

Proves the widened no-data/prompt invariant and reconciles the seven pre-existing tests the widening affected.

## Notes

This is a revision of an earlier proof. The first version wrote two tests recording a disagreement with the implementation (see the implementation record's own Notes); a person decided to widen the implementation rather than narrow the tests, which in turn required rewriting seven older tests in the same file that had asserted the opposite of the widened rule. All nine relevant tests now agree with one implementation and with each other.
The first full-suite attempt (run/fake-hypothesis-evaluator-no-data-usage-no-usage-or-elapsed-for-no-data-suite) failed its `test` step on two integration tests in files this task never touched (diagnose-e2e.spec.ts, diagnose-persistence-deadline-e2e.spec.ts); cause: test, on tests owned by task/request-body-size-limit/configured-body-limit, whose own fixtures still seeded a no-data evaluation carrying usage/elapsed_ms -- excess that task's own criteria never established, which this delivery's spec-conformant fix legitimately falsified. Answered by a proof-only re-delivery over that task (commit 848c20c4), never by touching those files here. The run named above (`-suite-2`) is the one taken after that re-delivery, with no change to this task's own source or tests between attempts.
