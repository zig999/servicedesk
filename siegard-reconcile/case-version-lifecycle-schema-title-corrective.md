---
contract_version: siegard-reconcile/3
title: Review of case-version-lifecycle-schema-title-corrective's delivered change
summary: 'Written by the delivery of task/case-version-lifecycle-schema-title-corrective/reword-the-stale-test-title
  under its own initiative, as its implementation record states: renamed the mutability test''s own title
  to name the revision''s own draft state as the governing condition, dropping the retired case-version-reference
  framing, with arrange/act/assert byte-for-byte unchanged.'
target: backend
files:
- path: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
  change: written by the delivery of task/case-version-lifecycle-schema-title-corrective/reword-the-stale-test-title
nodes:
- node: constraints/the-schema-replays-from-its-scripts
  conforms: true
  how: 'src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts: held at beforeAll''s
    migration replay (line 140), and the ordering-and-immutable-history test (lines 414-426); also exercised
    a second way by the backfill test''s own partial-then-full replay (lines 546-556) — await applyMigrationFiles(client,
    await migrationFilesInOrder());'
  encoded_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- node: domain/knowledge/hypothesis-revision
  conforms: true
  how: 'src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts: held at the hypothesis_revisions
    table''s CRUD — insertHypothesisRevision (lines 90-98) and the read-back of criterion/resolution (lines
    263-274); collects via hypothesis_revision_collects (lines 304-316). The state attribute and the release
    operation are not exercised anywhere in this file — IRevisionOptions carries no state field, and insertHypothesisRevision
    never names one on insert. — expect(rows).toEqual([{ criterion: ''A real criterion.'', resolution_outcome:
    glossary.outcome }]);'
  encoded_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  conforms: true
  how: 'src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts: held at the UPDATE-while-draft
    test, lines 287-302 — only the ''not yet released, writes in place'' branch is exercised here; the
    ''unless released, creates the next revision'' and ''no revision yet, creates revision 1'' branches
    are not tested in this file — UPDATE hypothesis_revisions SET criterion = ''A revised criterion.''
    WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1'
  encoded_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: false
  how: 'no named file holds this fact now: src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
    read `nowhere` — interface IRevisionOptions { slug: string; hypothesisName: string; revision: number;
    criterion?: string; } — no test in this file ever creates a hypothesis_revisions row in released state,
    attempts to alter one, or removes a hypothesis_revision_collects row belonging to one'
  observed_at:
  - src/__tests__/integration/persistence/case-version-lifecycle-schema.spec.ts
notes: 'Judged by 1 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/case-version-lifecycle-schema-title-corrective.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased,
  domain/knowledge/hypothesis-revision were read on every file and answered for, and bound from nowhere
  here — a binding this record writes is one the trace already held.

  Candidates: 0 opened across 0 of 1 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-version-lifecycle-schema-title-corrective.returns/`, which are the evidence behind every entry above.
