---
title: inconclusive-citation-check-hotfix, review
summary: What three passes found over the source and tests holding an inconclusive evaluation's citations
  to the same hypothesis-collects containment check confirmed and refuted evaluations already receive;
  the captured suite run passed clean, so no failures pass ran.
reviewed:
- src/investigation/judgment-stage.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
tasks:
- task/inconclusive-citation-check-hotfix/inconclusive-evaluations-citations-are-checked
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
- criterion: Where an evaluator's own outcome answers with verdict inconclusive and one or more citations,
    each citation is checked against the judged hypothesis-revision's own collects (rules/investigation/a-citation-stays-within-the-hypothesis-collects)
    before the evaluation is recorded — the check is never skipped merely because the verdict is not confirmed
    or refuted.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: checks an inconclusive first answer's own citation against the hypothesis-revision's own collects,
      retrying when the cited concept falls outside them — the check is never skipped merely because the
      verdict is not confirmed or refuted
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: never records an inconclusive outcome carrying an out-of-collects citation as if it had passed
      — a first answer and its retry both citing a concept outside the collects fall back to judgment-failure
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: retries an inconclusive first answer whose citation fails the collects-containment check, and
      falls back to judgment-failure when the retry citation fails it too
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: falls back to inconclusive judgment-failure when the retry's own inconclusive answer carries
      a citation that fails the collects-containment check too
  why: Every test bearing on this criterion asserts on judgeHypotheses()'s returned Evaluation; nothing
    in run-diagnosis.spec.ts drives an evaluator returning inconclusive with citations, so 'before the
    evaluation is recorded' is proven at the point the Evaluation is produced, not at the point one is
    persisted. Also, the test named 'retries an inconclusive first answer whose citation fails the collects-containment
    check' scripts a citation whose concept is inside the collects and fails only on the field-declaration
    half, despite its name.
- criterion: Where an inconclusive outcome's citations fail that check, the outcome is answered the same
    way a confirmed or refuted outcome that fails the check already is (the existing retry, and judgment-failure
    where the retry also fails or the deadline admits none) — never recorded with an out-of-collects citation
    as if it had passed.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: never records an inconclusive outcome carrying an out-of-collects citation as if it had passed
      — a first answer and its retry both citing a concept outside the collects fall back to judgment-failure
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: checks an inconclusive first answer's own citation against the hypothesis-revision's own collects,
      retrying when the cited concept falls outside them — the check is never skipped merely because the
      verdict is not confirmed or refuted
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: retries an inconclusive first answer whose citation fails the collects-containment check, and
      falls back to judgment-failure when the retry citation fails it too
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: falls back to inconclusive judgment-failure when the retry's own inconclusive answer carries
      a citation that fails the collects-containment check too
  why: 'Two stated parts go unexercised. ''Or the deadline admits none'' is not reached for an inconclusive
    first answer failing the check under a too-tight deadline — no test says whether a deadline-denied
    retry after a failed inconclusive citation answers judgment-failure or deadline-exceeded. And ''the
    same way ... already is'' is proven for verdict and citations but not for what the resulting Evaluation
    carries: the usage/elapsed_ms/prompt-stripping test covers a confirmed-then-refuted pair only, never
    an inconclusive answer that failed the check while carrying usage, elapsed_ms and prompt.'
- criterion: This fix changes nothing about which citations an inconclusive evaluation carries or their
    shape — including a no-data reason's own field-absent citations, whose collects-containment holds
    by construction (drawn from evidence already collected for the same hypothesis-revision) rather than
    by the checked-response remedy this task adds — it only adds the same containment check confirmed
    and refuted citations already receive to an outcome an evaluator actually returned.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: records inconclusive no-data citing every non-ok evidence item, and never enters the pool for
      that hypothesis
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: 'omits the field key entirely from each citation a no-data evaluation constructs for its non-ok
      evidence — never field: '''' — so ''field'' in citation is false for every one of them'
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: checks an inconclusive first answer's own citation against the hypothesis-revision's own collects,
      retrying when the cited concept falls outside them — the check is never skipped merely because the
      verdict is not confirmed or refuted
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: attaches the usage, elapsed_ms and prompt a first call's own inconclusive answer returned, passed
      through unchanged
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: leaves a confirmed evaluation's citation carrying both concept and field exactly as the evaluator
      answered it — 'field' in citation stays true, unaffected by the no-data citation shape now omitting
      it
  - file: src/__tests__/unit/investigation/judgment-stage.spec.ts
    name: leaves a refuted evaluation's citation carrying both concept and field exactly as the evaluator
      answered it — 'field' in citation stays true, unaffected by the no-data citation shape now omitting
      it
  why: A no-data outcome is only ever submitted, in this test set, with all its non-ok concepts already
    inside the collects, which is the by-construction case the criterion names rather than an independent
    check of it; and no test exercises a no-data outcome alongside an evaluator-returned inconclusive
    for the same hypothesis-revision.
findings:
- pass: standard
  file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  where: lines 29-40, function manifestEntryOf (and lines 20-27, function aHypothesis)
  cites: MNT-03
  evidence: 'function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry { return
    { position, hypothesis_revision: { hypothesis: { name: hypothesis.name }, revision: 1, criterion:
    hypothesis.criterion, collects: hypothesis.collects, resolution: hypothesis.resolution } }; }'
  cost: The identical block stands at run-diagnosis.spec.ts lines 48-59, with aHypothesis beside it duplicated
    too. The day ManifestEntry or HypothesisRevision gains or renames a field, one copy is updated and
    the other keeps compiling against the old shape.
  correction: move aHypothesis and manifestEntryOf into one shared test fixture module under src/__tests__/
    and have both spec files call it.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 510-516, inside 'does not resolve until persistence has actually written the investigation...'
  cites: TST-01
  evidence: const resultPromise = runDiagnosis(options); const tracker = trackSettlement(resultPromise);
    await vi.advanceTimersByTimeAsync(499); expect(tracker.settled()).toBe(false); await vi.advanceTimersByTimeAsync(1);
    const assessment = await resultPromise;
  cost: The settlement tracker is arranged after runDiagnosis has already been called, and an assertion
    sits between two clock advances, so the test has no single arrange block a reader can read to learn
    what it observes.
  correction: attach the tracker as part of the act, and split the 'has not settled at 499ms' claim into
    its own test.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 581-587, inside 'bounds persistence at the nominal two-second budget...'
  cites: TST-01
  evidence: 'const resultPromise = runDiagnosis(options).catch((error: unknown) => error); const tracker
    = trackSettlement(resultPromise); await vi.advanceTimersByTimeAsync(1_999); expect(tracker.settled()).toBe(false);
    await vi.advanceTimersByTimeAsync(1); const error = await resultPromise;'
  cost: Arrangement (the tracker) and an assertion both sit inside the acting sequence, so the two distinct
    claims this test makes cannot be told apart by reading the shape of the test.
  correction: arrange the tracker before or as part of the act, and give the 'not settled at 1_999ms'
    claim its own test.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 594-600, inside 'bounds persistence at what remains of the declared deadline...'
  cites: TST-01
  evidence: 'const resultPromise = runDiagnosis(options).catch((error: unknown) => error); const tracker
    = trackSettlement(resultPromise); await vi.advanceTimersByTimeAsync(299); expect(tracker.settled()).toBe(false);
    await vi.advanceTimersByTimeAsync(1); const error = await resultPromise;'
  cost: The tracker is built after the subject has been invoked and an assertion is interleaved between
    two advances, so a reader cannot see from the test's structure which observation is the behavior the
    test is named for.
  correction: build the tracker as part of the act step, and separate the mid-flight observation into
    its own test.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 653-660, inside 'bounds persistence by the time actually remaining once collection has
    already consumed part of the declared deadline...'
  cites: TST-01
  evidence: 'const resultPromise = runDiagnosis(options).catch((error: unknown) => error); await vi.advanceTimersByTimeAsync(700);
    const tracker = trackSettlement(resultPromise); await vi.advanceTimersByTimeAsync(299); expect(tracker.settled()).toBe(false);
    await vi.advanceTimersByTimeAsync(1); const error = await resultPromise;'
  cost: The arrangement lands in the middle of the act -- the tracker is created only after 700ms of collection
    has already been advanced past -- so the setup depends on a state the act produced.
  correction: attach the tracker at the moment the run is started, and assert the single remainingMs after
    the act completes; make the mid-flight observation its own test if it is worth keeping.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 739-745, inside 'bounds the retry by whatever of the stage bound the first attempt's own
    elapsed time left unspent...'
  cites: TST-01
  evidence: 'const resultPromise = runDiagnosis(options).catch((error: unknown) => error); const tracker
    = trackSettlement(resultPromise); await vi.advanceTimersByTimeAsync(1_999); expect(tracker.settled()).toBe(false);
    await vi.advanceTimersByTimeAsync(1); const error = await resultPromise;'
  cost: This is the test that distinguishes a retry bounded by the remainder from one granted a fresh
    budget, and that distinction lives entirely in the interleaved assertion, so a reader has to reconstruct
    the timeline rather than read it.
  correction: move the tracker's creation into the act, and split the 'still unsettled at 1_999ms' claim
    into a separate test.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 844-850, inside 'tightens judgment's own deadline to no more than the nominal five-second
    budget...'
  cites: TST-01
  evidence: const resultPromise = runDiagnosis(options); const tracker = trackSettlement(resultPromise);
    await vi.advanceTimersByTimeAsync(4_999); expect(tracker.settled()).toBe(false); await vi.advanceTimersByTimeAsync(1);
    const assessment = await resultPromise;
  cost: The tracker that carries half the claim is set up after the act, and the 'not before 5_000ms'
    assertion sits between two advances, so the test's own name promises one behavior while its body makes
    two claims.
  correction: return the tracker from the act step, and give the 'nothing settles before the five-second
    budget' claim its own test.
- pass: standard
  file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  where: lines 862-868, inside 'tightens judgment's own deadline to no more than what remains of the declared
    deadline...'
  cites: TST-01
  evidence: 'const resultPromise = runDiagnosis(options).catch((error: unknown) => error); const tracker
    = trackSettlement(resultPromise); await vi.advanceTimersByTimeAsync(1_499); expect(tracker.settled()).toBe(false);
    await vi.advanceTimersByTimeAsync(1); const error = await resultPromise;'
  cost: Setup and assertion are interleaved with the two advances, so the test cannot be read to find
    out what it claims -- a failure at either point reports the same name.
  correction: create the tracker as part of the act, and separate the mid-flight observation from the
    final assertion into two tests.
---

## What it is

The first review of inconclusive-citation-check-hotfix: coverage over its three criteria,
specification conformance over the two nodes it implements, and standard conformance over the
project's own registry. The captured suite run passed clean, so the failures pass did not run.

## Notes

The specification-conformance pass found no divergence: judgment-stage.ts's noDataEvaluation and
the runIsolatedCall/retryOrFail routing match both nodes' text exactly, including the no-data
by-construction exemption the decision log records. The standard-conformance pass flagged one
recurring test-structure pattern (a settlement tracker attached after the subject under test is
already invoked, with an assertion interleaved between two clock advances) across seven tests in
run-diagnosis.spec.ts -- filed as seven separate findings since each sits in a different test, but
answerable by one decision about how these timing tests are shaped. That reviewer also flagged an
ambiguity in the standard's own TST-01 wording (whether advancing a fake clock counts as "acting")
which it did not resolve on its own authority, applying the narrower reading and naming two tests
in judgment-stage.spec.ts that would be departures under the wider one.
