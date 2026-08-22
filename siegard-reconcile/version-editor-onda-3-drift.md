---
contract_version: siegard-reconcile/1
title: Code drift from version-editor onda 3's own delivery
summary: 'task/version-editor/new-draft-creation legitimately modified two files other tasks'' bindings
  still claim -- src/routes/case-detail-screen.tsx (bound by task/cases-list-and-detail/case-detail-timeline
  in Onda 2) and src/shared/components/app-shell.tsx (bound by an Onda 1 task) -- and a bind restamps
  only the delivering task''s own nodes, leaving both bindings asserting a digest that is no longer there.
  The premise here is the delivered source itself: it already passed review/version-editor-onda-3.md''s
  own coverage, conformance and standard passes; this reconciliation asks the narrower question of whether
  the specification still describes what these two files now state.'
target: frontend
files:
- path: src/routes/case-detail-screen.tsx
  change: adds a "New draft" Link, rendered only when hasDraft is false, immediately after the case heading
- path: src/shared/components/app-shell.tsx
  change: adds a "New Draft" breadcrumb label to ROUTE_LABELS for the new "/cases/$slug/versions/new"
    route
nodes:
- node: domain/knowledge/case
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: the route param and heading (`const { slug } = useParams(...)`, `<h1>Case {slug}</h1>`) read only
    the case's own stable identity, matching the node's "A case's own stable identity, named once and
    never shared with another case."
- node: domain/knowledge/case-version
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: CaseVersionListItem reads only `version` and `state`, consistent with the node's own declared attributes;
    the file claims no other attribute of the aggregate.
- node: domain/knowledge/case-version-state
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: '`type CaseVersionState = "draft" | "released";` matches the node''s enumeration exactly.'
- node: contracts/knowledge/case-query
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: the queryFn reads `/v1/cases/{slug}/versions`, one of the contract's own stated listings ("the
    versions of one named case").
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: '`hasDraft = data.data.some((version) => version.state === "draft")` gates the New draft Link,
    matching the rule''s own "a case has at most one version in draft state at a time" -- the new Link
    this task added is itself an application of this same rule, not a departure from it.'
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  encoded_at:
  - src/routes/case-detail-screen.tsx
  how: '`data.data.map((version) => toRow(slug, version))` still renders every version the response carries,
    matching "every version of a case remains readable; the store keeps every version, not the last."'
- node: constraints/no-route-enforces-authentication
  conforms: false
  observed_at:
  - src/shared/components/app-shell.tsx
  how: 'line 117, Topbar''s `right` slot: `right={<span>No auth in this build</span>}`. The absence of
    authentication is a fact the specification already states in this constraint node; hard-coding it
    again here as literal UI text gives that fact a second home with no link back to the node. If a later
    build closes the gap the constraint describes, nothing ties this string to that change -- the constraint
    node is amended while this component keeps asserting the old fact to every user of every screen. This
    is a pre-existing condition of app-shell.tsx (written in Onda 1, unrelated to this task''s own one-line
    breadcrumb addition); the reconciliation surfaces it because this file''s binding to this node needed
    rejudging regardless of which line in the file moved.'
notes: 'Two delegations, one per named file, each passed the nodes the trace already binds that file to
  plus the other file''s own nodes as candidates for misattribution; neither judge opened a candidate.
  The six case-detail-screen.tsx nodes are unions of one file''s own reading (no node is bound to more
  than one of these two files). constraints/no-route-enforces-authentication is not bound by this record:
  it stays exactly as it stood, still reported by `trace.py --check`, and the finding above -- not this
  task''s own change -- is why. It answers to no criterion of task/version-editor/new-draft-creation or
  any other task in this initiative, so it is not this reconciliation''s to resolve by writing source
  or a node; per this skill''s own two routes, the specification already states this fact (constraints/no-route-enforces-authentication),
  so the source is what would need to change -- which is a corrective increment through /plan-work naming
  app-shell.tsx''s own hard-coded string as the one wrong behavior, never an /analyse over a fact the
  specification already holds.'
---
