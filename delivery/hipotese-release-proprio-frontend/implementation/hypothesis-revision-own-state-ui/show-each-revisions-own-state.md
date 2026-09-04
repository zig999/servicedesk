---
title: Show each revision's own state on the hypothesis-revisions listing
summary: Widens the listing hook's item type with the revision's own draft/released state and renders it as an independent StatusTable column on the revision-history screen, beside the existing current/frozen pin badge.
task: sha256:9500e8ee50f5c6b5576680687c9129878b814cc5534ec1dd57376f5df418aa9c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-own-state-ui-show-each-revisions-own-state-build-4
files:
- path: src/hooks/use-hypothesis-revisions.ts
  effect: 'Exports a new HypothesisRevisionState = "draft" | "released" type and adds a required `state: HypothesisRevisionState` field to HypothesisRevisionListItem, matching the field the backend''s listing endpoint already answers.'
- path: src/routes/hypothesis-revision-history.tsx
  effect: Adds a "State" column (key `state`) to REVISION_COLUMNS, maps each row's `state` cell through a new REVISION_STATE_CELL lookup (draft -> bg-warning/"Draft", released -> bg-success/"Released"), and keeps the existing "Status" column (current/frozen pin indicator) as a second, independent cell on the same row.
- path: src/hooks/use-manifest-row-revisions.spec.ts
  effect: 'Adds a default `state: "released"` to the pre-existing `revisionItem()` fixture factory, so every fixture it builds satisfies HypothesisRevisionListItem''s now-required `state` field; overrides can still set a different state where a future test needs one.'
criteria:
- criterion: The typed page shape the revisions listing hook answers carries a per-revision own-state field whose value is draft or released and nothing else.
  met: true
  how: 'HypothesisRevisionListItem in use-hypothesis-revisions.ts now carries `state: HypothesisRevisionState`, where HypothesisRevisionState is the closed union "draft" | "released" - no third value is representable.'
- criterion: Every row the revision-history screen renders states the own state of the revision on that row.
  met: true
  how: 'The row-mapping function in hypothesis-revision-history.tsx sets `state: REVISION_STATE_CELL[revision.state]` unconditionally for every revision in the sorted list, so every rendered row carries the cell.'
- criterion: A revision the listing answers as draft renders as draft and a revision it answers as released renders as released.
  met: true
  how: REVISION_STATE_CELL is a total, direct lookup keyed by the exact `revision.state` value ("draft" -> label "Draft", "released" -> label "Released"), so the rendered label tracks the answered value with no intermediate branching that could invert or default it.
- criterion: A row states its revision's own state and the case's current-pin indication as two separate facts, so a row can read released and not-current at the same time.
  met: true
  how: The row object carries two independent keys, `state` (own state, from REVISION_STATE_CELL) and `status` (current/frozen, from the pre-existing isCurrent comparison against currentPin.pinnedRevision) - rendered as two separate StatusTable columns, computed from two unrelated inputs (revision.state vs. currentPin.pinnedRevision), so any combination (e.g. released and frozen) renders as such.
- criterion: The revision numbers, criteria and collects each row already showed are unchanged, and the rows stay ordered highest revision first.
  met: true
  how: The `revision`, `criterion` and `collects` row fields and the `.slice().sort((a, b) => b.revision - a.revision)` ordering are untouched by this edit; only a new `state` key was added to the same row object.
- criterion: The hypotheses tab's per-hypothesis revision count still reads the listing's own total after the shape widens.
  met: true
  how: case-hypotheses-tab.tsx's revisionCounts consumption reads only `countResult.data.total` from HypothesisRevisionsPage, a field untouched by widening HypothesisRevisionListItem; verified this is the file's only read of the shared query's data.
nodes:
- node: domain/knowledge/hypothesis-revision
  how: The aggregate's own `state` attribute (draft/released, held independently of any case version or manifest) is the fact the widened HypothesisRevisionListItem type now carries and the row renders; the task adds no new attribute beyond what this node already declares.
  encoded_at:
  - src/hooks/use-hypothesis-revisions.ts
- node: domain/knowledge/hypothesis-revision-state
  how: The enumeration's two values, draft and released, are exactly the HypothesisRevisionState union and the two REVISION_STATE_CELL entries; no third value is representable in either the type or the render lookup.
  encoded_at:
  - src/hooks/use-hypothesis-revisions.ts
  - src/routes/hypothesis-revision-history.tsx
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  how: This is the rule the task exists to satisfy - every row the screen renders now states its revision's own draft/released state through the new "State" column, sourced directly from the listing response's `state` field rather than derived or inferred client-side.
  encoded_at:
  - src/routes/hypothesis-revision-history.tsx
- node: rules/knowledge/a-hypothesis-revisions-listing-answers-highest-revision-first
  how: Governs the same listing this task renders; the screen's pre-existing `.sort((a, b) => b.revision - a.revision)` ordering, which this task left untouched, is what satisfies it - the task adds no new fact toward this rule, only preserves the existing one.
  encoded_at:
  - src/routes/hypothesis-revision-history.tsx
- node: constraints/listings-are-paged
  how: Governs the endpoint this screen's hook calls; this task widens only the per-item shape (adding `state`), leaving HypothesisRevisionsPage's data/total and the hook's paging behavior untouched, so the constraint continues to hold exactly as before with no code of its own to add here.
inferences:
- inferred: The listing's per-revision own-state field is named `state` and its type is the closed union "draft" | "released".
  from: 'The backend''s HypothesisRevisionListItem (src/src/case/case-store.port.ts) already declares `readonly state: HypothesisRevisionState` with HYPOTHESIS_REVISION_STATES holding exactly "draft" and "released" (src/src/persistence/relational-case-store.repository.ts), which is the literal shape the listing endpoint answers over the wire.'
- inferred: The own-state badge uses bg-warning/"Draft" for draft and bg-success/"Released" for released.
  from: 'The identical draft/released two-state lifecycle is already rendered this exact way in three other screens (cases-list-screen.tsx, case-simulation-header.tsx, case-detail-screen.tsx: `draft: { color: "bg-warning", label: "Draft" }, released: { color: "bg-success", label: "Released" }`), and the inventory names the StatusTable status-cell convention as the pattern to reuse for a per-row lifecycle state.'
- inferred: The new column is placed between "Revision" and the existing "Status" (current/frozen) column, keyed `state` and headed "State".
  from: No node or reference states column order or header text; this groups the revision's own identity-adjacent facts (number, own state) before the case-relative fact (current/frozen pin), and avoids colliding with the existing "status" key already used for the pin indicator.
- inferred: use-manifest-row-revisions.spec.ts's `revisionItem()` fixture factory defaults the new required `state` field to "released" rather than "draft".
  from: 'The typecheck failure (TS2322, `state?: HypothesisRevisionState | undefined` not assignable to the now-required `state: HypothesisRevisionState`) against this pre-existing fixture; none of that file''s own criteria assert anything about a revision''s own state, so either literal value satisfies the type without narrowing what the type or this task''s criteria require, and overrides remain free to set a different state.'
preserved:
- The revision-history screen's loading, error and empty-history states, and the "Back to hypotheses" and "uses no revision" messaging, none of which this task touched.
- The existing current/frozen pin column, its bg-success/bg-muted-foreground coloring, and the "Revise ->" link rendered only on the current row, all unchanged in behavior and markup.
- case-hypotheses-tab.tsx's row-count fetch via hypothesisRevisionsQueryOptions and its read of `.total`, which required no change under the widened item type.
- use-manifest-row-revisions.spec.ts's existing assertions and fixture-override mechanism, both left intact - only a default value was added to the factory, not a change to what it verifies.
deferred:
- what: use-hypothesis-revision-form.ts declares its own independent, unexported HypothesisRevisionListItem/HypothesisRevisionsPage types and its own apiFetch call against the same revisions endpoint, rather than reusing hypothesisRevisionsQueryOptions/useHypothesisRevisions - and its local type does not carry `state`.
  why: This task's criteria and covered nodes concern the revisions listing hook and the history screen only; that duplicate fetch is a pre-existing arrangement this task's inventory does not name as touched, and reconciling or widening it is a separate change outside what was cut here.
---
## What it is

The listing hook's item type gains the revision's own state and the history screen renders it as an independent StatusTable column.
The existing current/frozen pin badge stays what it is, beside the new fact rather than in place of it.
A pre-existing test fixture that constructed a HypothesisRevisionListItem without a state value was given a default, so the widened type does not break it.

## Notes

The first two build attempts failed on the target's own environment, not on this delivery: the frontend/tui submodule was uninitialized and its own separately-installed node_modules was then missing, both documented preconditions of this project's own tree, not defects this task introduced.
The third build attempt failed on a genuine consequence of this task's own change: widening HypothesisRevisionListItem to require state broke a pre-existing fixture factory in use-manifest-row-revisions.spec.ts, fixed by giving that factory a default value for the new field.
