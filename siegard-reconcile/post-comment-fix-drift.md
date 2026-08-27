---
contract_version: siegard-reconcile/1
title: 'cases-list-screen.tsx: 3 bindings stale from the comment-only correction'
summary: 'Today''s corrective delivery (cases-list-screen-stale-comment/comment-cites-the-current-nodes)
  rewrote this file to correct two stale claims in one JSDoc comment. A bind restamps only the nodes its
  own delivery record names, so the file''s other 3 bindings — for the case-query contract, the case identity
  shape and the case-version-state enumeration, none of which the comment fix touched — went stale as
  a side effect. The human states the file''s behavior is unchanged: CaseIdentity, CaseSummary''s field
  shapes, fetchCaseSummary, fetchCasesWithSummaries, CaseVersionState and CASE_STATE_CELL are all byte-identical.'
target: frontend
files:
- path: src/routes/cases-list-screen.tsx
  change: only the JSDoc comment above the CaseSummary type changed (two stale claims corrected to cite
    the current specification); every other line, including CaseIdentity, the CaseSummary type's own field
    shapes, fetchCaseSummary, fetchCasesWithSummaries, CaseVersionState and CASE_STATE_CELL, is unchanged
nodes:
- node: contracts/knowledge/case-query
  conforms: true
  how: fetchCasesWithSummaries (GET /v1/cases, list-cases), fetchCaseSummary's probe/second call (GET
    /v1/cases/:slug/versions, list-case-versions) and its third call (GET /v1/cases/:slug/versions/:version,
    read-case) encode operations the contract names and none it doesn't; no comment restates the contract's
    operation list as its own vocabulary
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case
  conforms: true
  how: 'CaseIdentity = { readonly slug: string } holds exactly what GET /v1/cases answers (slug alone),
    explicitly scoped by its own comment and sourced to case-store.port.ts''s wire type rather than claimed
    as the full aggregate; states nothing about next_version or create-draft and contradicts neither'
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: CaseVersionState = "draft" | "released" and CASE_STATE_CELL hold exactly the node's two values,
    no more, no fewer; the surrounding comment's claim that neither node names a color for either state
    is accurate
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: domain/knowledge/case-summary
  conforms: true
  how: this file's own binding to this node is not stale — it was freshly written today by delivery/frontend-spec-conformance-corrections/implementation/cases-list-screen-stale-comment/comment-cites-the-current-nodes.md's
    own bind, backed by that delivery's independent proof. Named here only because the trace binds this
    file to it and this record must answer for every node a named file carries, not because a fresh reading
    ran; no new judgment was made.
  encoded_at:
  - src/routes/cases-list-screen.tsx
- node: rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  conforms: true
  how: this file's own binding to this node is not stale — it was freshly written today by the same delivery
    as above, backed by its independent proof. Named here only because this record must answer for every
    node the trace binds to this file; no new judgment was made.
  encoded_at:
  - src/routes/cases-list-screen.tsx
notes: One delegation, over the one named file, judged against the 3 nodes the trace's own drift report
  named as stale on this file after today's comment-only correction. domain/knowledge/case-summary and
  rules/knowledge/a-case-summary-is-derived-from-its-existing-versions, also bound to this file, were
  not part of that delegation's judgment — both were freshly bound today by this session's own comment-fix
  delivery and its independent proof — and are carried in this record's nodes only because the bind form
  requires every node a named file answers to be accounted for; their how cites that prior delivery rather
  than a fresh reading. All 3 delegated nodes cleared.
---

## What it is

Reconciles the 3 bindings on cases-list-screen.tsx that today's comment-only corrective delivery
left stale, as a side effect of restamping only the two nodes its own record named.

## Notes

None.
