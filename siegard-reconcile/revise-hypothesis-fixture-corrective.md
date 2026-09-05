---
contract_version: siegard-reconcile/3
title: Review of revise-hypothesis-fixture-corrective's delivered change
summary: 'Written by the delivery of task/revise-hypothesis-fixture-corrective/correct-titles-and-release-write-duplication
  under its own initiative, as its implementation record states: two stale test titles were retitled to
  name the conditions their bodies actually exercise, and the fixture''s own release-write helper was
  rewritten to call the case lifecycle''s guarded releaseHypothesisRevision operation instead of a raw
  SQL UPDATE.'
target: backend
files:
- path: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  change: written by the delivery of task/revise-hypothesis-fixture-corrective/correct-titles-and-release-write-duplication
nodes:
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/__tests__/integration/case/revise-hypothesis.operation.spec.ts: held at the it block at lines
    336–356, asserting releaseHypothesisRevisionOwnState''s second call against an already-released revision
    — expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);'
  encoded_at:
  - src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/revise-hypothesis-fixture-corrective.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/knowledge/hypothesis-revision,
  rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased, rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 4 opened across 1 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/revise-hypothesis-fixture-corrective.returns/`, which are the evidence behind every entry above.
