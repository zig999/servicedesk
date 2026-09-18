---
target: backend
title: not-grounded reason restored to the well-formed-inconclusive test
summary: The one stale assertion in anthropic-hypothesis-evaluator.adapter.spec.ts now reads
  reason not-grounded for a well-formed {"verdict":"inconclusive"} model answer, its own test
  renamed to match, with every sibling judgment-failure assertion in the file left untouched.
implementation: sha256:520142e50ad9d3064175a3481eaa11ff56f489db4d13436e60f6782a1c9e0483
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/register-capability-payload-notes-corrections-suite-5
tests:
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: "maps the model's own well-formed inconclusive answer to reason not-grounded"
  proves: A test giving the adapter a well-formed model answer of {"verdict":"inconclusive"}
    asserts the resulting outcome carries reason 'not-grounded', not 'judgment-failure'.
  fails_when: outcomeFromModelText's parsed.verdict === 'inconclusive' branch stops calling
    notGroundedOutcome — e.g. it reverts to judgmentFailureOutcome, or the outcome carries any
    reason other than 'not-grounded' for this well-formed inconclusive model answer.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when the model response is not valid JSON
  proves: The sibling assertions in the same file for a response that failed to parse at all,
    that parsed into no recognized shape, or that never arrived because the provider call
    rejected, still assert reason 'judgment-failure', unchanged.
  fails_when: parseJsonOrUndefined/parseJudgment stops returning undefined for text that fails
    JSON.parse, so outcomeFromModelText no longer reaches judgmentFailureOutcome for this case,
    or this pre-existing assertion is altered.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when the model response is valid JSON but matches none of the three declared shapes
  proves: The sibling assertions in the same file for a response that failed to parse at all,
    that parsed into no recognized shape, or that never arrived because the provider call
    rejected, still assert reason 'judgment-failure', unchanged.
  fails_when: parseJudgment stops returning undefined for a verdict value outside VERDICTS, or
    this pre-existing assertion is altered.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when the model answers valid JSON that is a top-level array rather than an object
  proves: The sibling assertions in the same file for a response that failed to parse at all,
    that parsed into no recognized shape, or that never arrived because the provider call
    rejected, still assert reason 'judgment-failure', unchanged.
  fails_when: isPlainObject/parseJudgment stops returning undefined for a top-level JSON array,
    or this pre-existing assertion is altered.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when a confirmed answer carries a citation entry that is not an object
  proves: The sibling assertions in the same file for a response that failed to parse at all,
    that parsed into no recognized shape, or that never arrived because the provider call
    rejected, still assert reason 'judgment-failure', unchanged.
  fails_when: parseJudgment stops returning undefined when a confirmed answer's citation entry
    is not a plain object, or this pre-existing assertion is altered.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when a confirmed answer carries no citations
  proves: The sibling assertions in the same file for a response that failed to parse at all,
    that parsed into no recognized shape, or that never arrived because the provider call
    rejected, still assert reason 'judgment-failure', unchanged.
  fails_when: parseJudgment stops returning undefined when a confirmed answer's citations array
    is empty, or this pre-existing assertion is altered.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure, never throwing, when the provider call itself rejects
  proves: The sibling assertions in the same file for a response that failed to parse at all,
    that parsed into no recognized shape, or that never arrived because the provider call
    rejected, still assert reason 'judgment-failure', unchanged.
  fails_when: requestJudgment's catch stops turning a rejected provider call into
    judgmentFailureOutcome, so evaluate() throws or answers a different reason, or this
    pre-existing assertion is altered.
not_applicable:
- edge_case: An inconclusive model answer arriving after the evaluation's deadline, or over
    evidence that did not collect ok.
  why: Criterion 1 is stated over, and its fixture (SOME_OK_EVIDENCE, a synchronous mocked
    resolve) already satisfies, only the well-formed-inconclusive-within-deadline-over-ok-
    evidence case. The deadline-exceeded and no-data branches are separate production paths
    this correction's single assertion does not reach; they are owned by the collection-timeout
    work the task's own REMAINDER note names, which this correction does not touch.
- edge_case: A confirmed or refuted model answer.
  why: Both of this task's criteria concern only the inconclusive-verdict path. The
    confirmed/refuted paths are unchanged by this correction and are already asserted by other
    pre-existing tests in this file that this task does not touch.
untested:
- "domain/investigation/evaluation-reason: no test in this file, or elsewhere reviewed, asserts
  EVALUATION_REASONS is exactly ['no-data','judgment-failure','deadline-exceeded','not-grounded']
  and no more. The corrected test exercises only the single value 'not-grounded' in one
  scenario, so the enumeration's fact, taken whole, is not decided by any finite test this proof
  found or wrote."
- "rules/investigation/an-inconclusive-evaluation-declares-its-reason: the invariant's own
  no-data-citation clause and its deadline-exceeded clause are not exercised by anything in
  anthropic-hypothesis-evaluator.adapter.spec.ts. The corrected test and its unchanged siblings
  decide only the not-grounded-vs-judgment-failure clause, and only for evidence that already
  collected ok and a call that already resolved before any deadline concern. The no-data clause
  is exercised elsewhere (e.g. hypothesis-evaluator.port.spec.ts's no-data fixture test) and the
  deadline-exceeded clause is left to the collection-timeout work, which this correction does not
  touch."
divergences:
- from: the framework convention that a corrective proof supersedes, or names, the
    implementation/proof record it corrects
  departure: This correction falsifies and rewrites a pre-existing assertion (and renames its
    test) in src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    with no owning implementation/proof record to supersede — that assertion, and the test
    file's original body, predate this project's task-tracked delivery discipline over this
    file, so there is nothing upstream this record can cite as superseded.
  why: The stale 'judgment-failure' assertion was written before this framework governed the
    file. An earlier delivery (inconclusive-response-not-judgment-failure/distinct-reason)
    changed the production adapter to split the not-grounded case out, but no task-tracked
    record owns this specific pre-existing test assertion, so this correction has nothing to
    pin against. Disclosed here since a later review holding this file to the same rules is not
    shown this record unless it is written down.
---

## What it is

Rewrites the one now-false assertion in anthropic-hypothesis-evaluator.adapter.spec.ts's
well-formed-inconclusive test to read the reason the production adapter already returns,
leaving every sibling judgment-failure assertion in the file unchanged.

## Notes

None.
