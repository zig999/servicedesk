---
contract_version: siegard-reconcile/1
title: Code drift from manifest-hypothesis-authoring onda 4's own delivery
summary: 'task/manifest-hypothesis-authoring/hypotheses-tab legitimately modified src/routes/case-detail-screen.tsx
  (wrapping its existing content in a Tabs component alongside a new Hypotheses tab) and task/manifest-hypothesis-authoring/revise-hypothesis-form
  legitimately modified src/shared/components/app-shell.tsx (a new breadcrumb label) -- both files were
  already bound by earlier tasks (Onda 1-3), and a bind restamps only the delivering task''s own nodes,
  leaving those earlier bindings stale. The premise here is the delivered source itself: it already passed
  review/manifest-hypothesis-authoring-onda-4.md''s own coverage, conformance and standard passes (pending);
  this reconciliation asks the narrower question of whether the specification still describes what these
  two files now state.'
target: frontend
files:
- path: src/routes/case-detail-screen.tsx
  change: wraps the existing Versions content and a new CaseHypothesesTab in TUI's Tabs/TabsList/TabsTrigger/TabsContent,
    Versions selected by default; the Versions tab's own body is otherwise unchanged, now reading through
    an extracted useCaseVersions hook
- path: src/shared/components/app-shell.tsx
  change: adds a "New Hypothesis" breadcrumb label to ROUTE_LABELS for the new "/cases/$slug/versions/$version/manifest/hypotheses/new"
    route
nodes:
- node: domain/knowledge/case
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: the file carries only the case's slug identity through props and route params, matching the node's
    own stable identity; next_version is never referenced or asserted.
- node: domain/knowledge/case-version
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: each row reads only `version.version` and `version.state` off the fetched item, the two attributes
    the node makes visible at this granularity.
- node: domain/knowledge/case-version-state
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: STATE_CELL is keyed by exactly the enumeration's own two values (draft/released); the color/label
    pairing is disclosed by the file's own comment as inference, not claimed as a spec fact.
- node: contracts/knowledge/case-query
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: the file's own comment names list-case-versions, one of the contract's five declared operations,
    matching the GET /v1/cases/:slug/versions call it makes.
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: hasDraft gates the "New draft" link to render only when the fetched list holds no draft, matching
    "at most one version in draft state at a time".
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: every item the query returns becomes a row; nothing filters to the latest or drops any entry, matching
    "the store keeps every version, not the last".
- node: constraints/no-route-enforces-authentication
  conforms: false
  observed_at:
  - src/shared/components/app-shell.tsx
  how: 'line 122, Topbar''s right slot: `right={<span>No auth in this build</span>}`. This restates the
    same fact the previous reconciliation (siegard-reconcile/version-editor-onda-3-drift.md) already found
    against this same construct, unchanged: hard-coding the absence of backend authentication as literal
    UI text gives that fact a second home with no link back to the constraint node. The file''s newest
    edit (the New Hypothesis breadcrumb label) did not touch this line or this fact.'
notes: 'Two delegations, one per named file, each passed the nodes the trace already binds that file to
  plus the other file''s own nodes as candidates for misattribution; neither judge opened a candidate.
  constraints/no-route-enforces-authentication is not bound by this record, for the second time running:
  it stays exactly as it stood, still reported by trace.py --check, and the finding above -- pre-existing,
  not caused by this onda''s own tasks -- is why. The route for it remains a corrective increment through
  /plan-work, never an /analyse (the specification already states this fact).'
---
