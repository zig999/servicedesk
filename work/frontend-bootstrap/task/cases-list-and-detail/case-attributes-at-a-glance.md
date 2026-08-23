---
title: Case attributes at a glance
summary: Adds a third view on Case Detail surfacing the case's current version's own declared attributes, with one state-sensitive action addressed to that version, and an explicit state for when that version's own whole read is refused.
rationale: >-
  Kept as one task because reading the case's current version whole, rendering its attributes,
  and choosing the one state-sensitive action that follows are one falsifiable outcome -- what a
  curator sees and can do at a glance -- and one reason to change. It depends on case-detail-
  timeline because the new view sits alongside the Versions tab that task already renders, and
  because "the case's current version" is resolved from the same list-case-versions response that
  task establishes; on edit-draft-version because the whole-version read reuses its
  GET /v1/cases/{slug}/versions/{version} call and case-version-record.ts shape; and on
  new-draft-creation because the "no draft" branch's action navigates into the flow that task
  delivers.
  The scope names three action labels for one state-sensitive action ("Continue editing", "View
  released vX", "New draft from vX") whose stated conditions overlap ("if not editing" and "if the
  case holds a released version but no draft" name the same state twice under two different
  labels). I resolved this by rendering both "View released vX" and "New draft from vX" together
  when the case's current version is released and no draft exists -- a read link to that version's
  own read-only route, and a write action to originate the next one -- rather than choosing one
  over the other; this is a decomposition choice the scope's own prose did not spell out at this
  grain, left open for the human reviewer to correct if the intended reading was a single control.
  I did not extend this task to close scenarios/knowledge/a-case-holding-no-versions-is-told-
  explicitly (a case whose one and only version was discarded, holding none): the scope's own
  three-way action list names no fourth "no version" branch, and case-detail-timeline's own
  existing empty-state handling is left exactly as it stands -- introducing that closure here would
  be scope this onda did not ask for.
objective: Case Detail gains a third view surfacing the case's current version's own declared attributes, with one action matching whichever state that version stands in, and an explicit state when that version's own whole read is refused.
criteria:
  - Case Detail renders a third view, alongside Versions and Hypotheses, surfacing the case's current version's own title, when_to_use, subject, fallback outcome/referral and consolidation_register.
  - The current version resolved for that view is the case's own draft version when it holds one, otherwise its latest released version.
  - Where the current version is a draft, the view's action reads "Continue editing" and navigates to that draft's own route.
  - Where the current version is released, the view renders "View released vX" (X its own version number) navigating to that version's own read-only route, and "New draft from vX" navigating into the New Draft flow, addressed by that same version's own number.
  - Where the current version's own read via read-case itself refuses -- e.g. a draft whose manifest currently holds no hypothesis -- the view renders that refusal as its own explicit named state, distinguishable from a generic load error, offering the same "Continue editing" link the draft's own state would otherwise show.
implements:
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/consolidation-register
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - contracts/knowledge/case-query
  - rules/knowledge/every-case-version-remains-readable
  - constraints/a-case-is-read-whole
  - rules/knowledge/validation-runs-at-every-read
  - domain/knowledge/case-summary
  - rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
depends_on:
  - task/cases-list-and-detail/case-detail-timeline
  - task/version-editor/edit-draft-version
  - task/version-editor/new-draft-creation
sources:
  - intake/onda-7-scope.md
---

## What it is
The case-attributes-at-a-glance view capability 3 of the onda-7 scope describes, reading the case's current version whole rather than only the version-metadata list-case-versions already returns.
The first task in this epic to render the specific refusal read-case's own whole-version validation can produce, distinguishable from a generic load error.

## Notes
The inventory's own risk stands here directly: error-ui-state.ts currently maps CaseNotValidError only to the generic "generic-error" kind; this task's own explicit-state criterion needs a distinguishable kind added to that vocabulary.
This task does not depend on view-released-version-read-only even though its own "View released vX" link targets the same route that task renders read-only: the criterion here is navigation only, addressed by the version's own number, independently demonstrable the same way case-detail-timeline's own "Continue editing" link never depended on edit-draft-version existing first.
ADVISORY, from the specification — criterion 2 ("the case's own draft version when it holds one, otherwise its latest released version") presupposes that a case holds at most one draft version at a time -- only then is "the case's own draft version" a well-defined singular thing to resolve rather than a choice among several. That fact is stated by rules/knowledge/a-case-has-at-most-one-draft, a node already named in this epic's own covers (marked uncovered there since Onda 2) but outside this task's own candidate set. The candidates given do supply the companion reasoning -- that the highest-numbered version is always the most recently authored one, whichever of draft or released its state is, per rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's own Description -- but not the uniqueness-of-draft fact itself.
