---
contract_version: siegard-reconcile/3
title: Review of manifest-collects-survive-release-duplication-corrective's delivered change
summary: 'Written by the delivery of task/manifest-collects-survive-release-duplication-corrective/route-through-the-declared-lifecycle-operation
  under its own initiative, as its implementation record states: the fixture''s own releaseRevisionDirectly
  helper was rewritten to call the case lifecycle''s guarded releaseHypothesisRevision operation instead
  of a raw SQL UPDATE against hypothesis_revisions.'
target: backend
files:
- path: src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
  change: written by the delivery of task/manifest-collects-survive-release-duplication-corrective/route-through-the-declared-lifecycle-operation
nodes:
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: "src/__tests__/integration/case/manifest-collects-survive-release.spec.ts: held at the insertHypothesisRevision\
    \ call inside placeNewHypothesis (lines 138-148), which supplies criterion, collects and resolution\
    \ per revision, and the releaseRevisionDirectly calls that trigger the revision's own release operation\
    \ independently of any case-version release — const revision = await store.insertHypothesisRevision({\n\
    \    slug: key.slug,\n    hypothesis_name: hypothesis.name,\n    criterion: `a criterion for ${hypothesis.name}`,\n\
    \    collects: hypothesis.collects,\n    resolution: hypothesis.resolution,\n  });"
  encoded_at:
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
- node: domain/knowledge/hypothesis-revision-state
  conforms: true
  how: "src/__tests__/integration/case/manifest-collects-survive-release.spec.ts: held at the sequence\
    \ of releaseRevisionDirectly calls in the third test (lines 281-286), which exercises the draft-to-released\
    \ transition and the refusal of a second release against an already-released revision, without ever\
    \ asserting a state value directly — await releaseRevisionDirectly(slug, 'h', revision);\n\n    const\
    \ refusal = await releaseRevisionDirectly(slug, 'h', revision).catch((error: unknown) => error);"
  encoded_at:
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/__tests__/integration/case/manifest-collects-survive-release.spec.ts: held at the assertion
    closing the third test, line 286 — expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);'
  encoded_at:
  - src/__tests__/integration/case/manifest-collects-survive-release.spec.ts
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/manifest-collects-survive-release-duplication-corrective.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/knowledge/hypothesis-revision,
  rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle were read on every file and
  answered for, and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/manifest-collects-survive-release-duplication-corrective.returns/`, which are the evidence behind every entry above.
