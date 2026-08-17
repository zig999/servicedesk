---
title: ICaseStore gains listHypothesisRevisions
summary: RelationalCaseStore and its ICaseStore port now expose listHypothesisRevisions, paginating a
  named hypothesis's own revisions read directly from hypothesis_revisions and refusing an unknown slug
  or hypothesis name through CaseNotFoundError.
task: sha256:749a1c94c71b97b091baf684d8f2ea9851c8be6cf6b013d8b1ed552f7712e016
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/store-extensions-batch-suite
files:
- path: src/case/case-store.port.ts
  effect: declares HypothesisRevisionListItem (revision, criterion, collects, resolution) and adds listHypothesisRevisions(slug,
    hypothesisName, pagination) to ICaseStore.
- path: src/persistence/relational-case-store.repository.ts
  effect: 'implements listHypothesisRevisions: one transaction running a hypothesis-identity check against
    hypotheses (case_slug, name), the total, the page of hypothesis_revisions ordered by revision, and
    that page''s own collects grouped by revision.'
- path: src/__tests__/unit/case/case-query.service.spec.ts
  effect: added a minimal listHypothesisRevisions stub to FakeCaseStore.
criteria:
- criterion: Calling listHypothesisRevisions with an existing slug and hypothesis name returns every revision
    that hypothesis currently holds, paginated per src/types/pagination.ts.
  met: true
  how: listHypothesisRevisionsPage reads every row of hypothesis_revisions for the given (case_slug, hypothesis_name),
    ordered by revision, joined to its own collects, returning the full PaginatedResponse envelope.
- criterion: Calling listHypothesisRevisions with a slug or hypothesis name that does not exist is refused
    with CaseNotFoundError.
  met: true
  how: requireHypothesisIdentity checks hypotheses for (case_slug, name) before any count or page read
    runs; its absence — whether the slug names no case or the case never originated that hypothesis —
    throws CaseNotFoundError uniformly.
nodes:
- node: contracts/knowledge/case-query
  how: Implements the contract's own list-hypothesis-revisions operation.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/case
  how: Honored rather than encoded — the case's own slug is the identity requireHypothesisIdentity ultimately
    answers for.
- node: domain/knowledge/hypothesis
  how: This node's own 'named uniquely within its case across every version' is why hypothesis_revisions
    is queried directly by (case_slug, hypothesis_name) and never joined through any manifest.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: domain/knowledge/hypothesis-revision
  how: HypothesisRevisionListItem carries exactly this node's own declared attributes beyond its hypothesis
    relationship — revision, criterion, collects, resolution.
  encoded_at:
  - src/case/case-store.port.ts
  - src/persistence/relational-case-store.repository.ts
- node: constraints/a-case-is-read-whole
  how: Honored, not reached with a new fact — this constraint's own description carves out independent
    hypothesis-revision reads from the whole-assembly path.
inferences:
- inferred: A listing item is the revision's full content (revision, criterion, collects, resolution)
    rather than a lighter identity.
  from: no separate 'read one revision' operation exists in this port for a lighter listing item to defer
    detail to, unlike CaseVersionListItem/HypothesisIdentity.
- inferred: A single existence check against hypotheses (case_slug, name) answers both an unknown slug
    and an unknown hypothesis name with one CaseNotFoundError.
  from: hypotheses.case_slug's own foreign key to cases(slug) — a hypotheses row can exist only for a
    real case.
- inferred: Collects for the named hypothesis are read unscoped by page — every revision's collects, grouped
    by revision — rather than filtered to just the current page.
  from: the existing collectsByHypothesisName convention this same file already keeps for a version's
    manifest.
- inferred: A page of revisions is ordered by revision number ascending.
  from: the same stable-page-boundary convention already documented at casesPageSelect, caseVersionsPageSelect
    and hypothesesPageSelect.
preserved:
- Every existing ICaseStore method's own signature and behavior — none touched.
---

## What it is

A new read-only ICaseStore method, listHypothesisRevisions, refusing an unknown slug or hypothesis name.

## Notes

None.
