---
title: judgment-stage-dead-throws-removal-hotfix, review
summary: What three passes found over the source and tests removing judgment-stage.ts's two throws for
  conditions the specification already makes unreachable; the captured suite run passed clean, so no failures
  pass ran.
reviewed:
- src/investigation/judgment-stage.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
tasks:
- task/judgment-stage-dead-throws-removal-hotfix/remove-the-two-unreachable-throws
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run passed clean, so there was no failure to diagnose
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: Every name requires-evaluation-of(case) returns resolves to a hypothesis in that same case's
    own manifest (rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses); judgment-stage.ts's
    hypothesisNamed no longer contains a throw for the case where it does not.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: hypothesisNamed's body no longer contains a throw for a name absent from the case's own hypotheses
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: no longer rejects naming the missing hypothesis when a required name is not found among the
      case's own hypotheses — only the unguarded property access fails, with no message naming it
  why: 'The throw-is-gone half is exercised. The ''every name requires-evaluation-of(case) returns resolves...''
    half is unexercised: nothing in the set calls requires-evaluation-of at all, so no test would fail
    if it began returning a name the case''s manifest does not hold, which is the fact the throw''s removal
    rests on. The one mismatched-case test is constructed to show the throw is gone, not to show the invariant
    holds.'
- criterion: The evidence map judgment-stage.ts is given always holds an entry for every hypothesis requires-evaluation-of(case)
    names, given that hypothesis collects at least one concept; judgment-stage.ts's evidenceFor no longer
    contains a throw for the case where it does not.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: evidenceFor's body no longer contains a throw for a required hypothesis absent from evidenceByHypothesis
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: no longer rejects naming the missing hypothesis when evidenceByHypothesis carries no entry for
      a required hypothesis — only the unguarded property access fails, with no message naming it
  why: 'The throw-is-gone half is exercised. The ''always holds an entry...'' half is unexercised: every
    test constructs the evidence map by hand in the test body, so nothing exercises whatever populates
    it in the running system. The stated qualifier (a hypothesis that collects at least one concept) is
    also untouched -- no test builds a hypothesis whose collects is empty.'
- criterion: Neither hypothesisNamed nor evidenceFor is rewritten to return an optional or undefined value
    for the condition its throw is removed from — their return types stay non-optional (a Hypothesis;
    an evidence array), so a silent fallback cannot type-check in the throw's place.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: hypothesisNamed's declared return type stays the non-optional Hypothesis, never Hypothesis |
      undefined, so a silent fallback cannot type-check for a name absent from the case's hypotheses
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: evidenceFor's declared return type stays the non-optional readonly Evidence[], never readonly
      Evidence[] | undefined, so a silent fallback cannot type-check for a hypothesis absent from evidenceByHypothesis
  why: Each test reads the module's own source and requires the declared signature in its non-optional
    form. The trailing clause -- that a silent fallback cannot type-check -- is the compiler's answer
    and not this suite's; nothing here runs tsc.
- criterion: Neither removal introduces a new fallback or default value for the condition it removes —
    the code path is deleted because it is unreachable, not replaced with a synthesized hypothesis or
    an empty evidence array standing in for a case the specification does not admit.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: hypothesisNamed introduces no fallback or default value in the removed throw's place
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: evidenceFor introduces no fallback or default value in the removed throw's place
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: no longer rejects naming the missing hypothesis when a required name is not found among the
      case's own hypotheses — only the unguarded property access fails, with no message naming it
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: no longer rejects naming the missing hypothesis when evidenceByHypothesis carries no entry for
      a required hypothesis — only the unguarded property access fails, with no message naming it
  why: What binds the criterion is the pair of behavioral tests requiring a bare TypeError from the unguarded
    access; any standing-in value would make judgeHypotheses resolve, or reject with something other than
    a TypeError, and fail them.
- criterion: judgeHypotheses' observable behavior over a pinned case's own required hypotheses is unchanged
    by this removal — every existing passing test for the judgment stage still passes.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: answers exactly one evaluation per required hypothesis, in the case's declared order, none omitted
      or duplicated
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: retries once on a decided answer whose citations fail structural validation, and returns the
      retry's valid decided answer
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records deadline-exceeded, never judgment-failure, for a call that has not returned by the stage's
      deadline
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records inconclusive no-data citing every non-ok evidence item, and never enters the pool for
      that hypothesis
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the usage, elapsed_ms and prompt a first call's own decided, structurally valid answer
      returned, onto the resulting Evaluation
  why: The full set of pre-existing behavioral tests (order, per-hypothesis isolation, pool concurrency,
    retry and its fallbacks, both deadline paths, no-data citation shape, usage/elapsed_ms/prompt attachment)
    still exercises the module; whether they pass is a run's answer (the captured suite run passed), not
    readable from the files alone.
findings:
- pass: standard
  file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  where: lines 58-74, aCaseWithMismatchedHypotheses(), against aCase() at lines 42-56
  cites: MNT-03
  evidence: 'function aCase(hypotheses: ...): Case { return { slug: ''a-case'', title: ''A case'', ...,
    manifest: declared.map(...), hypotheses: declared }; } function aCaseWithMismatchedHypotheses(requiredHypotheses,
    actualHypotheses): Case { return { slug: ''a-mismatched-case'', title: ''A mismatched case'', ...,
    manifest: requiredHypotheses.map(...), hypotheses: actualHypotheses }; }'
  cost: The whole Case literal -- eight identical field values and the same manifest construction -- exists
    twice in one file. When Case gains or renames a field, only one of the two builders will be updated,
    and the fixture that silently keeps the old shape is the one used by the two new missing-hypothesis
    tests.
  correction: build the mismatched case from aCase() and override only what differs -- the hypotheses
    array and the identifying slug and title.
- pass: standard
  file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  where: lines 244-252, inside the test 'never starts more evaluate() calls at once than the configured
    pool size...'
  cites: TST-01
  evidence: await vi.advanceTimersByTimeAsync(1); expect(...).toEqual(['h1 criterion', 'h2 criterion']);
    await vi.advanceTimersByTimeAsync(9); expect(...).toEqual(['h1 criterion', 'h2 criterion', 'h3 criterion']);
    await vi.advanceTimersByTimeAsync(1_000); const result = await resultPromise;
  cost: Acting and asserting alternate three times, so no single place in the test states what it claims.
    A reader who sees the second assertion fail cannot tell whether the pool admitted h3 too early or
    whether the preceding advance was the wrong window.
  correction: split the timeline into separate tests, one claim each, so each test arranges its clock,
    acts once and asserts once.
- pass: standard
  file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  where: lines 507-516, inside the test 'keeps a hypothesis's retry under the same pool slot it already
    holds...'
  cites: TST-01
  evidence: await vi.advanceTimersByTimeAsync(2); expect(...).toEqual(['h1 criterion', 'h1 criterion']);
    await vi.advanceTimersByTimeAsync(60); expect(...).toEqual(['h1 criterion', 'h1 criterion', 'h2 criterion']);
    await vi.advanceTimersByTimeAsync(10); const result = await resultPromise;
  cost: The same alternation of act and assert, and here the arrangement it depends on is a further file
    away -- retrySameSlotFixture() holds the delays that make the advance numbers correct. A reader meeting
    a failure has to reconstruct that timing from two places.
  correction: state the delays and the windows they imply in one arrangement inside the test, and assert
    the single claim the name makes after one act.
- pass: standard
  file: src/investigation/judgment-stage.ts
  where: lines 85-88 in runIsolatedCall(), repeated at lines 111-114 in retryOrFail()
  cites: MNT-03
  evidence: const first = await raceEvaluateAgainstDeadline(evaluator.evaluate(...), deadlineGuard); if
    (first === DEADLINE_ELAPSED) { return deadlineExceededEvaluation(name); } ... const retry = await
    raceEvaluateAgainstDeadline(evaluator.evaluate(...), deadlineGuard); if (retry === DEADLINE_ELAPSED)
    { return deadlineExceededEvaluation(name); }
  cost: '''Call the evaluator, and answer deadline-exceeded if the deadline won the race'' is written
    out twice, identically apart from the local name. A change to this decision has to be made in both,
    and the one that is missed still compiles and still returns an Evaluation; the suite would not catch
    it either, since the deadline tests exercise only the first-call path.'
  correction: extract the race and its deadline branch into one helper returning either the outcome or
    the deadline-exceeded Evaluation, and have both runIsolatedCall() and retryOrFail() call it.
---

## What it is

The first review of judgment-stage-dead-throws-removal-hotfix: coverage over its five criteria,
specification conformance over the four nodes it implements, and standard conformance over the
project's own registry. The captured suite run passed clean, so the failures pass did not run.

## Notes

The specification-conformance pass found no divergence. Coverage found the two criteria naming
the invariants the removed throws relied on (requires-evaluation-of always resolving; the evidence
map always holding an entry) are proven only for "the throw is gone," never for the underlying
invariant itself, since every test builds its case and evidence map by hand rather than driving
them through the producers the removal now trusts.
