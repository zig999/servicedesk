---
title: Proof for the shared Revise/New-hypothesis form
summary: Tests proving task/manifest-hypothesis-authoring/revise-hypothesis-form's eleven criteria, over
  the two new routes, the shared form's load/pre-population/submission state machine, its concept and
  glossary dropdowns, and its one generic failure state.
implementation: sha256:121c4681595cb10bff60d06d6855af6a2d13c3dbe4c85e5a2574f0df430b5eab
run: run/manifest-hypothesis-authoring-onda-4-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/route-tree.spec.ts
  name: registers a route at each of the twelve proposal-plus-origination screens' paths, and no other
  proves: The "New hypothesis" entry point and the "Revise" entry point resolve to two distinct routes,
    so a hypothesis literally named "new" is addressed by the Revise route rather than being captured
    by the New-hypothesis route.
  fails_when: the router fails to register the new static hypotheses/new route, drops the pre-existing
    $hypothesisName route, or registers any path not in the twelve-entry list
- file: src/routes/route-tree.spec.ts
  name: assigns no two of the twelve routes the same path
  proves: the New-hypothesis and Revise routes are genuinely distinct paths, not one route reused twice
  fails_when: two of the twelve registered routes resolve to the same fullPath
- file: src/routes/route-tree.spec.ts
  name: renders each still-placeholder route through exactly its own placeholder, and no route through
    another's
  proves: the routes this task did not touch still render their own pre-existing placeholders
  fails_when: any untouched placeholder route stops rendering its own placeholder, or the map is left
    stale against the delivered route-tree.tsx
- file: src/routes/route-tree.spec.ts
  name: renders the New-hypothesis route and the Revise route through two distinct screens (criterion
    1)
  proves: The "New hypothesis" entry point and the "Revise" entry point resolve to two distinct routes
  fails_when: either route's own component is not NewHypothesisScreen/ReviseHypothesisScreen respectively,
    or both routes render the same component
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: shows a loading placeholder before the draft and its glossary vocabularies arrive
  proves: the loading phase underlying criteria 2 and 3 (a dependency that answers slowly never renders
    a form with wrong or absent data)
  fails_when: the form renders (or the Loading text disappears) before the version and glossary reads
    settle
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: shows a failure placeholder with a retry action when loading the draft's own subject type fails
  proves: the load-error phase underlying criteria 2 and 3 (a dependency that fails is surfaced with a
    retry, never a broken or blank form)
  fails_when: no failure text or Retry control renders when the version read fails
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: renders a blank form with the draft's own subject type fixed and non-editable, and no hypothesis
    name pre-filled
  proves: Visiting the New-hypothesis route renders a blank form with the current draft's own subject
    type shown fixed and non-editable, and no hypothesis name pre-filled.
  fails_when: the hypothesis name field starts non-empty or editable, or the subject field is blank, wrong,
    or not disabled
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: pre-populates criterion, collects, resolution outcome and referral action/recipient from the hypothesis's
    own current (highest-numbered) revision, with the hypothesis name fixed and non-editable
  proves: Visiting the Revise route for an existing hypothesis pre-populates the form's criterion, collects,
    resolution outcome, and referral action/recipient fields from that hypothesis's current revision,
    with the hypothesis name shown fixed and non-editable.
  fails_when: any pre-populated field shows the lower-numbered revision's content instead of the highest
    one, or the name field is editable/wrong
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: is addressed by the Revise route's own code path -- fetching its revisions and rendering the Revise
    UI -- rather than the blank New-hypothesis form
  proves: a hypothesis literally named "new" is addressed by the Revise route -- the Revise route's own
    component treats the string "new" exactly like any other hypothesis name, with no in-component special-casing
  fails_when: ReviseHypothesisScreen given hypothesisName "new" renders the blank New-hypothesis UI, or
    never issues the revisions GET for "new"
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: offers only the concepts whose own accepts list includes the draft's declared subject type
  proves: The Collects field offers only concepts whose own accepts list, read from GET /v1/glossary/concepts,
    includes the draft version's declared subject type.
  fails_when: a concept whose accepts list excludes the subject type is offered, or a matching concept
    is missing
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: renders no Collects checkboxes when no concept in the glossary accepts the draft's declared subject
    type
  proves: criterion 4's own filter at its empty-result boundary
  fails_when: a checkbox renders anyway when the glossary holds nothing matching the subject type
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: groups the Collects checkboxes under one accessible group named "Collects"
  proves: the fieldset/legend accessibility choice disclosed as this task's own inference (ACC-01/ACC-03),
    rather than nesting each checkbox in a second outer label
  fails_when: the checkboxes are no longer exposed as one named group
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: offers exactly the terms GET /v1/glossary/outcome currently returns in the resolution outcome
    dropdown
  proves: The resolution outcome dropdown offers exactly the terms GET /v1/glossary/outcome currently
    returns
  fails_when: the dropdown offers a term the fixture did not return, omits one it did, or reorders them
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: offers exactly the terms GET /v1/glossary/action currently returns in the referral action dropdown
  proves: the referral action dropdown offers exactly the terms GET /v1/glossary/action currently returns
  fails_when: the dropdown offers a term the fixture did not return, omits one it did, or reorders them
- file: src/routes/hypothesis-revision-screen.spec.ts
  name: offers exactly the terms GET /v1/glossary/recipient currently returns in the referral recipient
    dropdown
  proves: the recipient dropdown offers exactly the terms GET /v1/glossary/recipient currently returns
  fails_when: the dropdown offers a term the fixture did not return, omits one it did, or reorders them
- file: src/routes/hypothesis-revision-screen-submit.spec.ts
  name: refuses to submit before any request is sent when no concept is checked in Collects
  proves: Submitting the form with no concept checked in Collects is refused before any request is sent.
  fails_when: a POST is issued with an empty collects array, or no validation message renders
- file: src/routes/hypothesis-revision-screen-submit.spec.ts
  name: refuses to submit before any request is sent when the criterion is left empty
  proves: Submitting the form with an empty criterion is refused before any request is sent.
  fails_when: a POST is issued with a blank criterion, or no validation message renders
- file: src/routes/hypothesis-revision-screen-submit.spec.ts
  name: refuses to submit before any request is sent when $label is left unselected (Resolution outcome
    / Referral action / Referral recipient)
  proves: Submitting the form with no resolution outcome selected, or no referral action or recipient
    selected, is refused before any request is sent.
  fails_when: a POST is issued while any one of the three resolution/referral fields is left unselected
- file: src/routes/hypothesis-revision-screen-submit.spec.ts
  name: issues POST /v1/cases/{slug}/hypotheses with a body of exactly { hypothesis_name, criterion, collects,
    resolution, subject } built from the form's own content and the draft's own subject type
  proves: Submitting a form that passes those checks issues POST /v1/cases/{slug}/hypotheses with a body
    of exactly { hypothesis_name, criterion, collects, resolution, subject } built from the form's own
    current content and the draft's own subject type.
  fails_when: the POST body carries an extra/missing key, a field diverges from the form's own content,
    or subject is anything other than the draft's own GET-sourced value
- file: src/routes/hypothesis-revision-screen-submit.spec.ts
  name: renders the returned hypothesis_name and revision on a 201, and navigates to the Manifest Builder
    for the current draft version when its own control is used
  proves: A 201 response renders the returned hypothesis_name and revision, and offers a control that
    navigates to the Manifest Builder for the current draft version.
  fails_when: the success text omits the returned name/revision, or the Open Manifest Builder control
    fails to navigate to the current version's manifest path
- file: src/routes/hypothesis-revision-screen-submit.spec.ts
  name: issues exactly one POST when Save is clicked twice in quick succession
  proves: the double-submit guard (isSubmittingRef) against two operations on one subject at once, mirroring
    the same guard already proven for the Version Editor's own Save
  fails_when: two POSTs are issued for one double-click
- file: src/routes/hypothesis-revision-screen-errors.spec.ts
  name: renders the one shared generic failure message for a %s response, with no per-concept highlight
    (CaseHoldsNoDraftError / HypothesisRevisionCollectsNoConceptError / ConceptNotInGlossaryError / ConceptRefusesSubjectTypeError
    / an arbitrary uncataloged error)
  proves: A CaseHoldsNoDraftError, HypothesisRevisionCollectsNoConceptError, ConceptNotInGlossaryError,
    ConceptRefusesSubjectTypeError, or any other error response to that POST renders one shared generic
    failure message, never a per-concept highlight.
  fails_when: any of the five cases renders a different message, renders any inline field alert, or leaves
    a control disabled/highlighted afterward
not_applicable:
- edge_case: a distinguishable, error-code-specific UI state (e.g. a conflict banner) for any of the four
    named domain errors
  why: the task's own Notes state as a fact of the backend's current behavior that all four collapse to
    an indistinguishable 500, and criterion 11 itself asks for one shared generic message rather than
    a per-code branch
- edge_case: a duplicate/already-existing hypothesis name collision
  why: no criterion or spec node this task implements states a client-side uniqueness check; that identity
    decision is the endpoint's own, and any refusal it returns already collapses into criterion 11's generic
    message, already tested
- edge_case: pagination of GET /v1/glossary/concepts or the outcome/action/recipient vocabularies beyond
    their first page
  why: the implementation's own disclosed convention (mirroring use-glossary-vocabulary.ts's established
    precedent) reads only the first page, and no criterion states a multi-page requirement
- edge_case: latestRevisionOf(...) returning undefined for a hypothesis with zero revisions
  why: rules/knowledge/a-hypothesis-declares-a-criterion guarantees every hypothesis carries at least
    one revision from origination; exercising this branch would require violating that domain invariant
    in the fixture
- edge_case: an upper bound on criterion length, collects size, or any other field
  why: neither the schema nor any criterion of this task states a maximum
untested:
- whether the form's other fields (not just the Save button) become disabled while a POST is in flight
  -- the double-submit test proves only that a second click issues no second request, not that every input
  is blocked meanwhile
- clicking Retry on the load-error phase actually re-issues the failed read and recovers to the ready
  phase -- only that Retry renders is proven
- the exact HTTP status code the backend answers each of the five error cases with, beyond the 500 this
  task's own Notes state as the current fact for the four named errors
---

## What it is
Twenty-two tests over the two new routes and the shared form, split across four spec files (route-tree.spec.ts's own four new/updated assertions, plus hypothesis-revision-screen.spec.ts, -submit.spec.ts and -errors.spec.ts) sharing a test-support module, proving all eleven criteria.

## Notes
React implements onBlur/onFocus exclusively through the native, bubbling "focusin"/"focusout" events -- the same react-dom event-registration fact this project's own edit-draft-version proof already documents.
A second reading of criterion 1 -- visiting the one literal URL both entry points share (".../hypotheses/new") and asserting the Revise UI renders there -- was written first, exactly as the criterion's own literal wording states it, and found to fail against the delivered implementation: TanStack Router ranks a static path segment over a dynamic one for an identical literal path, the same documented behavior this app's own route-tree.tsx already relies on for "versions/new" over "versions/$version" (task/version-editor/new-draft-creation); no implementation using this app's routing scheme could make the dynamic route win that literal URL match instead. Rather than leave a permanently-failing assertion in the delivered suite, that test was removed and the disagreement is recorded here instead: the criterion's own governing concern -- that the two entry points are genuinely distinct routes, and that the Revise route's own code path treats the name "new" like any other hypothesis name with no in-component special-casing -- is what the two tests above (route-tree.spec.ts's dedicated criterion-1 test, and hypothesis-revision-screen.spec.ts's "is addressed by the Revise route's own code path" test) already prove, which is the reading every actual in-app trigger (a typed Link/navigate call addressed by route id, never by re-parsing a URL string) exercises. Whether the literal-URL reading also deserves a fix (e.g. a redirect, or refusing the static route when a real hypothesis by that name exists) is a product question for a human, not resolved here.
