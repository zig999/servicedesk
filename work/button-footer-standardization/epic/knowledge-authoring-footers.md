---
title: Knowledge authoring footers
summary: The hypothesis revision form and the case version editor moving their action rows into the shared ButtonFooter, one gaining the standard Cancel and the other carrying the Cancel it already has.
rationale: I grouped these two families into one epic because both are the curator's authoring surface over the knowledge context and both are the awkward cases the surveyor flagged, one having no slot and no Cancel at all and the other holding a Save that already lives outside its own form element.
sources:
- intake/scope.md
covers:
- contracts/knowledge/case-lifecycle
- contracts/system/case-authoring
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/knowledge/a-draft-versions-content-is-presented-only-from-its-own-record
- domain/knowledge/case
- domain/knowledge/manifest-entry
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
- scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
- scenarios/knowledge/revising-a-released-revision-creates-the-next
- rules/investigation/a-simulation-result-is-stale-once-its-source-changes
- scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
- scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
- contracts/investigation/case-simulation
- constraints/a-case-is-read-whole
- rules/knowledge/an-abandoned-revision-composition-writes-nothing
- rules/knowledge/a-surface-offering-release-states-which-release-conditions-the-draft-meets
- rules/knowledge/an-abandoned-case-version-edit-writes-nothing
- rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
- rules/knowledge/a-newly-created-draft-offers-no-act-before-its-own-record-arrives
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
uncovered:
- node: domain/knowledge/case
  why: The case identity is presented by the case detail screen, which carries no action row this plan migrates.
- node: domain/knowledge/manifest-entry
  why: Manifest entries are composed in the manifest builder, which carries no action row this plan migrates.
- node: rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
  why: Where a revise lands is decided behind the request, and no control this plan moves changes which revision is written.
- node: rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
  why: The versions listing is the case detail screen's, which this plan does not edit.
- node: scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
  why: What repeated saves leave in the store is read behind the request rather than from any control this plan moves.
- node: scenarios/knowledge/revising-a-released-revision-creates-the-next
  why: What a revise against a released revision creates is read behind the request rather than from any control this plan moves.
- node: rules/investigation/a-simulation-result-is-stale-once-its-source-changes
  why: Staling a shown result is decided where the cockpit reads on return, and no task here renders a simulation result or changes where an edit returns to.
- node: scenarios/investigation/a-returned-edit-stales-the-shown-simulation-result
  why: The cockpit that shows and stales the result is not a screen this plan edits.
- node: scenarios/investigation/an-in-place-revision-edit-stales-the-shown-result
  why: The cockpit that shows and stales the result is not a screen this plan edits, and the in-place revise is unchanged by moving a Save button.
- node: contracts/investigation/case-simulation
  why: The simulation screens carry no action row this plan migrates.
- node: constraints/a-case-is-read-whole
  why: Wholeness binds the case-query read behind the request, never a screen's controls.
- node: contracts/system/case-authoring
  why: Both binders under this epic left it out, independently and with the same reason. It states
    the capability's promise to the curator — compose a draft freely, release only once every rule
    answers together, trust a released version never to change — and every clause of that promise is
    stated concretely by domain/knowledge/case-version, contracts/knowledge/case-lifecycle and the
    rules this plan's tasks do implement. No criterion of either task answers it distinctly from
    those, so naming it would claim a demonstration neither task performs.
---

## What it is
The hypothesis revision form's action row and the case version editor's action row, both becoming the shared ButtonFooter.
It holds the two families whose action rows carry more than a Save button or no return control at all.

## Notes
The case version editor's Save changes button already lives outside the `<form>` element and reaches it through `form={CASE_VERSION_EDITOR_FORM_ID}`, and the surveyor records that this pattern must keep working rather than be re-derived.
The case version editor's Cancel is already composed as a secondary Button wrapping a router Link, and the surveyor records it as the composition the new default Cancel reuses.
The hypothesis revision form has no trailingActions slot and no Cancel today, so its footer is new plumbing rather than a slot reuse.
The scope leaves hypothesis-revision-history's own Back to hypotheses button untouched, because it toggles local state inside the case's hypotheses tab rather than navigating between screens.
