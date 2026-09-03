---
title: Always-visible manifest shortcut on the hypothesis-editing screen
summary: Proof that the ready-phase manifest shortcut renders before any save for both entry points, targets
  the exact case version the screen was opened on, adds no request, sits ahead of the form, disappears
  once a save resolves rather than surviving into the branch the repin rule says offers no route, and
  never duplicates the post-save offer.
implementation: sha256:68b98899b67778e029832378d071237a642beaef22a1f8b8a8d4e54a3c77bbd1
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-shortcuts-always-visible-manifest-shortcut-suite
tests:
- file: frontend/app/src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  name: the always-visible manifest shortcut on the ready phase (criterion 1) > navigates to the manifest
    of the case version the screen was opened on, before any save is made, when opened for a new hypothesis
  proves: Criterion 1 -- the ready phase, before any save, renders a control whose target is the manifest
    route of the case version the screen was opened on, for the new-hypothesis entry point.
  fails_when: No control renders in the ready phase before a save, or clicking it does not land the router
    on the manifest path of the opened case version.
- file: frontend/app/src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  name: the always-visible manifest shortcut on the ready phase (criterion 1) > also renders before a
    save when the screen was opened to revise an existing hypothesis
  proves: Criterion 1 holds for the revise-hypothesis entry point too, not only for the new-hypothesis
    one.
  fails_when: The control is absent, or navigates somewhere other than the manifest route, when the screen
    was opened through the revise-hypothesis route.
- file: frontend/app/src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  name: the manifest shortcut's target is built from the slug and version the screen was opened on (criterion
    2) > navigates to the manifest of that same case version rather than a hardcoded one, when opened
    for a different slug and version
  proves: Criterion 2 -- the control's target is built from the slug and version the screen was actually
    opened on, not a fixture default or any other case version.
  fails_when: The control navigates to a fixed/default slug and version instead of the ones present in
    the URL the screen was opened with.
- file: frontend/app/src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  name: the manifest shortcut's placement on the ready phase > renders before the hypothesis-name field
    in reading and tab order, rather than after the form
  proves: The implementation record's inference that the control is placed directly under the ready-phase
    heading, before HypothesisRevisionFormFields, rather than after the form fields.
  fails_when: The control is rendered after the hypothesis-name field instead of before it.
- file: frontend/app/src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  name: the manifest shortcut is absent before the ready phase is reached > renders no manifest shortcut
    while the draft and its glossary vocabularies are still loading
  proves: The control is scoped to the ready phase and does not leak into the loading phase.
  fails_when: The shortcut renders while the screen is still in the loading phase.
- file: frontend/app/src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  name: the manifest shortcut is absent before the ready phase is reached > renders no manifest shortcut
    when loading the draft's own subject type fails
  proves: The control is scoped to the ready phase and does not render on the load-error phase.
  fails_when: The shortcut renders on the load-error phase alongside or instead of the retry control.
- file: frontend/app/src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  name: a save that answers the same revision the draft's manifest entry already pinned > leaves the screen
    with no button offering any route to the manifest, not merely no "Open Manifest Builder" button
  proves: Criterion 5, and rules out the UNDERDETERMINED-entry-1 candidate implementation that keeps the
    always-visible shortcut rendered through and after a same-pin save, placing a route to the manifest
    in front of the curator on exactly the branch rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
    says offers none.
  fails_when: Any button (the always-visible shortcut kept alive into the success phase, or any other
    control) still offers a route to the manifest after a save whose answered revision equals the pinned
    one.
- file: frontend/app/src/routes/hypothesis-revision-screen-manifest-shortcut.spec.ts
  name: a save that answers a revision higher than the one pinned > offers exactly one route to the manifest
    -- the post-save offer -- not the always-visible shortcut as well
  proves: Criterion 6 continues to hold with exactly one control present, and the implementation record's
    inference that the always-visible control is confined to the ready phase rather than duplicated into
    the success phase.
  fails_when: The success phase renders the always-visible shortcut in addition to the post-save "Open
    Manifest Builder" offer, or renders neither.
- file: frontend/app/src/hooks/use-hypothesis-revision-form-manifest-shortcut.spec.ts
  name: useHypothesisRevisionForm — the always-visible manifest shortcut adds no request of its own (criterion
    4) > carries a callable onOpenManifest in the ready phase while the request set stays exactly the
    reads the screen already issues
  proves: Criterion 4 -- rendering the control adds no request beyond the two reads (case-version, hypothesis-revisions)
    plus the glossary reads the screen already issues, and the ready phase exposes a callable onOpenManifest.
  fails_when: The set of GET URLs requested by the time the ready phase is reached grows beyond the pre-existing
    six, or onOpenManifest is missing or not a function.
not_applicable:
- edge_case: Clicking the shortcut while a save is already in flight (isSubmitting true).
  why: No criterion or inference states the control should be disabled, hidden, or otherwise gated while
    a save is pending; the implementation renders it unconditionally throughout the ready phase regardless
    of isSubmitting, so asserting a specific enabled/disabled state here would test behavior no criterion
    requires.
- edge_case: Two rapid clicks of the shortcut (concurrent activation).
  why: The control performs a client-side navigate() call only, issuing no request and mutating no shared
    state this task added; a second click before the router settles performs the same idempotent navigation.
- edge_case: Duplicate manifest entries for the same hypothesis name.
  why: Governed entirely by pinnedRevisionFor's own pre-existing lookup, untouched by this task and proven
    by use-hypothesis-revision-form-pinned-revision.spec.ts; this task adds no new logic over manifest-entry
    lookup.
- edge_case: An empty collection rendered in place of the control.
  why: The control's target is a single fixed route built from slug and version, not a rendered collection,
    so no empty-collection case applies.
untested:
- 'Criterion 3 ("reuses the navigate-to-manifest call already built in use-hypothesis-revision-form.ts
  rather than a second construction of that route") is a claim about code organization, not a distinguishable
  observable outcome: two implementations -- one closure shared by both controls, one that duplicates
  the identical navigate({ to: ..., params: ... }) construction correctly a second time -- produce the
  exact same button-click-to-pathname behavior that criteria 1, 2 and 4''s tests, plus the pre-existing
  success-phase navigation test in hypothesis-revision-screen-submit.spec.ts, already exercise. Testing
  which construction ran would bind the test to an internal call rather than an observable outcome, which
  this framework''s judgment and the project''s own TST-01 both forbid. Left untested rather than guessed
  at.'
- The task's second UNDERDETERMINED entry -- the rule's third branch, "whenever that draft version's manifest
  holds no entry for the hypothesis at all" -- names no implementation to test against; it only observes
  that criteria 5 and 6 both presuppose a manifest entry already exists to compare against, so nothing
  in this task's criteria states what should happen going into a save when no entry exists yet. That gap
  is the binder's own finding about the task cut, not something a test can respond to without inventing
  the missing criterion myself.
---

## What it is
Tests over the ready-phase manifest shortcut (both entry points), its addressing, its request set, its scoping to the ready phase alone, and its non-duplication with the existing post-save offer.

## Notes
None.
