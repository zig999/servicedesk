---
title: View a released case version read-only
summary: Adds a "View" action to a released row on Case Detail's Versions tab and, on the Version Editor screen, renders a released version's entire stored content -- fields and manifest -- disabled with no Save, Release or Discard control.
rationale: >-
  Kept as one task, bundling the Versions-tab entry point and the destination's own read-only
  render mode, because both serve one falsifiable outcome and one reason to change -- a curator
  can look at a released version without being offered any way to alter it -- the same grain
  new-draft-creation already used for its own button-plus-destination bundling. It depends on
  case-detail-timeline because the "View" action is added to the exact actions-cell logic that
  task already renders (today `version.state === "draft" ? <Link>… : null`), and on
  edit-draft-version because the read-only render reuses that task's own CaseVersionEditorFormFields
  / CaseVersionEditorReadyView field set, its case-version-record.ts read shape, and its
  GET /v1/cases/{slug}/versions/{version} call -- the same read-only variant use-edit-draft-version-
  form.ts's own "ready" union already anticipates by carrying release and discard as optional
  fields.
  I did not add domain/knowledge/hypothesis, domain/knowledge/hypothesis-revision or
  rules/knowledge/hypotheses-are-ordered-by-precedence to this task's own implements even though
  the manifest listing shows a hypothesis's name, a revision's own number and its criterion:
  no criterion below asserts a hypothesis's own name uniqueness, a revision's own numbering or
  immutability, or that the declared order is the precedence the experts affirmed -- it renders
  the manifest exactly as the backend returns it, the same facts manifest-hypothesis-authoring
  already fully covers with its own tasks.
objective: Navigating from a released version's row on Case Detail opens the Version Editor rendering that version's entire stored content read-only, with no control that could change it.
criteria:
  - A released version's row in the Versions tab renders a "View" action, where today it renders none.
  - A draft version's row continues to render only "Continue editing", never a "View" action.
  - Clicking "View" navigates to that version's own route, performing no additional request beyond the load the route itself triggers.
  - Loading a version whose state is released renders its title, when_to_use, subject, fallback outcome/referral and consolidation_register fields, each disabled, from GET /v1/cases/{slug}/versions/{version}.
  - The read-only render shows no Save, "Release…" or "Discard draft" control.
  - The read-only render lists every manifest entry the response returns, in the order the response returns them, each showing its declared position, its hypothesis's name, its hypothesis-revision's own revision number and criterion.
implements:
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/consolidation-register
  - domain/knowledge/manifest-entry
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/glossary/subject-type
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - contracts/knowledge/case-query
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  - rules/knowledge/only-a-draft-case-version-may-be-discarded
depends_on:
  - task/cases-list-and-detail/case-detail-timeline
  - task/version-editor/edit-draft-version
sources:
  - intake/onda-7-scope.md
---

## What it is
The read-only render capability 1 of the onda-7 scope describes, over the same read-case GET the editor already issues.
The Versions-tab entry point into it, filling the actions-cell gap the inventory found for a released row.

## Notes
The inventory's own risk on CaseVersionManifestEntry's currently narrow projection (hypothesis_revision.collects only) applies here directly: rendering position, hypothesis name, revision and criterion needs a wider type than any existing hook or type currently carries.
This task does not address the empty-manifest read-back refusal (CaseNotValidError) the inventory also flags: a released version has already passed that coherence check at release time and stays valid once released, so this render path is never expected to hit it. That refusal's own explicit-state handling is case-attributes-at-a-glance's own concern instead, where a draft (not a released version) is the one that can still be incoherent.
ADVISORY, from the specification — criterion 6 requires the read-only render to show each manifest entry's hypothesis name and its hypothesis-revision's own revision number and criterion. Among this task's candidates, domain/knowledge/manifest-entry states only the entry's own position and its reference to a hypothesis-revision; it states neither the hypothesis's name nor the revision's own number or criterion. Those facts are declared by domain/knowledge/hypothesis (attribute `name`) and domain/knowledge/hypothesis-revision (attributes `revision` and `criterion`), neither of which is in this task's candidate set.
Decision, beyond the covers — stand: domain/knowledge/hypothesis and domain/knowledge/hypothesis-revision are deliberately excluded from version-editor's own covers (see that epic's own rationale) — this task renders a manifest entry's hypothesis name, revision number and criterion exactly as the backend already validated and returned them, testing none of those two nodes' own facts (a hypothesis's own name uniqueness, a revision's own numbering or immutability), which manifest-hypothesis-authoring's own tasks already fully cover with tests of their own.
REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once's statement has two clauses: a released version is never altered again, and revising a case's content composes the next draft version instead. Only the first clause is reached by this task's criteria (the read-only, control-free render of a released version). The second clause, about revising a released case starting its next draft, answers to no criterion here; it belongs to the task implementing revision of a released case (seed-new-draft-from-latest-released, this same epic).
REMAINDER, from the specification — rules/knowledge/only-a-draft-case-version-may-be-discarded's statement has two clauses: a case version may be discarded only while in draft state, and a released version is never removed. Only the second clause is reached by this task's criteria (no "Discard draft" control on a released version's read-only render). The first clause, about a draft's own eligibility for discard, answers to no criterion here; it belongs to task/version-editor/discard-draft-version, this same epic.
