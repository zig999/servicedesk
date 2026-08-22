---
title: "Hypotheses tab: case-scoped list and revision history"
summary: Replaces CaseHypothesesPlaceholder with a second Case Detail tab listing a case's hypotheses and, per hypothesis, its own closed, non-editable revision history, offering Revise only on the current revision.
rationale: >-
  Cut as its own task, distinct from the manifest and the authoring form, because browsing a
  case's hypotheses across every version is a different reason to change than reordering one
  version's manifest or submitting one hypothesis's content -- it reads list-hypotheses and
  list-hypothesis-revisions, neither of which either other task touches. It depends on
  revise-hypothesis-form for the Revise route it navigates to, the same consumer relationship
  manifest-builder has to that task.

  I omitted the wireframe's "Referenced by" column and its per-revision attribution here, taking
  the scope-deferral route the scope itself named as available: deriving it would require reading
  every version of the case for every hypothesis listed, a cost that grows with the case's whole
  version history rather than a bounded per-row cost, and no task in this wave is asked to pay
  it. The "current"/"frozen" label stays in without that cost: no hypothesis-revision is ever
  edited in place regardless of release status, so the highest-numbered revision is always
  "current" and every other one is always "frozen," a fact comparing revision numbers already
  tells.
objective: A curator can browse a case's hypotheses and each one's own revision history from a new Hypotheses tab in Case Detail, deriving each hypothesis's revision count client-side and reaching the Revise flow from a hypothesis's current revision.
criteria:
  - Case Detail renders a "Hypotheses" tab beside "Versions", using the existing tabs component, never as a top-level sidebar entry.
  - The Hypotheses tab lists every hypothesis GET /v1/cases/{slug}/hypotheses returns for the case, by name.
  - Each listed hypothesis's Revisions count is the total GET /v1/cases/{slug}/hypotheses/{name}/revisions reports for that hypothesis, not the length of a single returned page.
  - Selecting a hypothesis row navigates to, or expands into, that hypothesis's own revision-history view.
  - The revision-history view lists every revision GET /v1/cases/{slug}/hypotheses/{name}/revisions returns for that hypothesis, each rendered as a closed, non-editable block showing its own revision number, criterion and collects.
  - The revision holding the highest revision number is labeled "current"; every other revision is labeled "frozen".
  - >-
    "Revise ->" is rendered only on the revision labeled "current", and clicking it navigates to
    the Revise route pre-loaded with that hypothesis's name and that revision's own criterion,
    collects and resolution.
implements:
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/resolution
  - contracts/knowledge/case-query
  - contracts/knowledge/case-lifecycle
  - rules/knowledge/a-hypothesis-revision-number-is-never-reused
  - rules/knowledge/a-released-hypothesis-revision-is-never-altered
depends_on:
  - task/manifest-hypothesis-authoring/revise-hypothesis-form
sources:
  - intake/onda-4-scope.md
---

## What it is
The section 2.10 Hypotheses tab the scope describes, over the real list-hypotheses and list-hypothesis-revisions endpoints, which return name-only and revision-content-only payloads respectively with no cross-reference to a case version.
Reuses the existing generic StatusTable for both the hypothesis list and the revision-history rendering.

## Notes
This task is the first to introduce the tabs component into case-detail-screen.tsx, a file Onda 2/3 already delivered and reviewed with a single Versions view.
A hypothesis with zero revisions is impossible by the domain -- every hypothesis is born with revision 1 -- so no empty state is designed for the revision-history view, as the scope itself states.
rules/knowledge/a-hypothesis-revision-number-is-never-reused's own numbering-assignment mechanics (first revision is 1, each later one is exactly one past the highest existing) are exercised only by revise-hypothesis-form's write path, already covered there; this task only reads the resulting revision numbers and derives "current" as the maximum among them.
rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft constrains the revise-hypothesis operation's own success, not this tab's "Revise ->" button visibility: this task renders that control unconditionally on the current revision, regardless of whether the case currently holds a draft. A curator opening this tab for a case whose latest version is already released can still reach the Revise route; what happens there (a CaseHoldsNoDraftError, per revise-hypothesis-form's own criteria) is that task's own generic-failure handling, not a gate this task adds.
