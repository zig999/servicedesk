---
title: Repin offer conditioned on the pin actually falling behind
summary: Screen-level tests over the hypothesis-editing success surface proving the manifest-builder step
  is offered exactly where a save's answered revision differs from the draft's pin, plus a hook-level
  test proving the pin used in that comparison is the one captured before the save rather than re-read
  afterwards.
implementation: sha256:103c066e2b48ccfdd07eb4e752d7731edbd7280d89b0d2a6e28b4ab1d425bfc6
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-repin-affordance-repin-offered-only-when-the-pin-fell-behind-suite-2
tests:
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: offers no manifest-builder step
  proves: After a save answering the same revision number the draft's manifest entry pinned going into
    it, the screen offers no manifest-builder step.
  fails_when: The manifest-builder button renders after a save whose answered revision (2) equals the
    pin captured before the save (2).
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: still states the hypothesis was saved as that revision number
  proves: After a save answering the same revision number the draft's manifest entry pinned going into
    it, the screen still states that the hypothesis was saved as that revision number.
  fails_when: The success message naming the saved revision number stops rendering, or renders the wrong
    number, once the manifest-builder offer is withheld.
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: offers the manifest-builder step even though the save's response carries no field distinguishing
    an overwrite from a created revision
  proves: After a save answering a revision number higher than the one the draft's manifest entry pinned
    going into it, the screen offers the manifest-builder step; and the screen decides the offer from
    the two revision numbers alone, even though the save's answer carries no field distinguishing an overwrite
    from a created revision.
  fails_when: The manifest-builder button fails to render after a save whose answered revision (3) is
    higher than the pin captured before the save (2), given a mocked response carrying only hypothesis_name
    and revision.
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: states the saved revision number after a save that moved the pin forward, not only after one that
    left it in place
  proves: 'The task''s own UNDERDETERMINED note: rules/knowledge/a-revise-answers-the-revision-number-it-saved
    states the saved revision number reaches the curator in both branches, so the screen must state it
    after a save answering a higher revision too, not only after one that left the pin in place.'
  fails_when: The success message naming the saved revision number stops rendering, or renders the wrong
    number, after a save that answered a revision higher than the pin.
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: navigates to the manifest of the draft case version the screen was opened on
  proves: Activating the offered step navigates to the manifest of the draft case version the screen was
    opened on, at the same route it navigates to today.
  fails_when: Clicking the offered manifest-builder button fails to navigate the router to /cases/$slug/versions/$version/manifest
    for the draft case version the screen was opened on.
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: offers the manifest-builder step
  proves: After a save of a hypothesis that had no entry in the draft case version's manifest, the screen
    offers the manifest-builder step.
  fails_when: The manifest-builder button fails to render after a save of a brand-new hypothesis holding
    no prior manifest entry.
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: leaves the screen offering no manifest-builder step after save number 1
  proves: Three successive saves that each answer the revision number the draft's manifest entry pins
    leave the screen offering no manifest-builder step after each of them (first of three).
  fails_when: The manifest-builder button renders after the first of three same-revision saves.
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: leaves the screen offering no manifest-builder step after save number 2
  proves: Three successive saves that each answer the revision number the draft's manifest entry pins
    leave the screen offering no manifest-builder step after each of them (second of three).
  fails_when: The manifest-builder button renders after the second of three same-revision saves.
- file: src/routes/hypothesis-revision-screen-repin-offer.spec.ts
  name: leaves the screen offering no manifest-builder step after save number 3
  proves: Three successive saves that each answer the revision number the draft's manifest entry pins
    leave the screen offering no manifest-builder step after each of them (third of three).
  fails_when: The manifest-builder button renders after the third of three same-revision saves.
- file: src/hooks/use-hypothesis-revision-form-repin-offer.spec.ts
  name: still reports no manifest-builder offer for a same-revision save even though the draft's own manifest
    entry has since moved to a lower pin while that save was still in flight
  proves: 'The implementation record''s own inference: the revision compared against the answered save
    is captured explicitly at the moment the revise mutation starts, rather than re-derived from the case-version
    query''s data when the success phase later renders.'
  fails_when: The comparison reads the case-version query's data at render time instead of the pin captured
    in onMutate, so mutating the cached manifest to a lower pin mid-flight (1) while the save still resolves
    with revision 2 would compute a spurious offer (2 > 1) instead of the correct no-offer (2 == the pin
    of 2 captured before the save).
untested:
- A save answering a revision number lower than the one the draft's manifest entry pinned. The monotonicity
  that rules this out is rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased's own guarantee,
  which this task's REMAINDER note places outside its scope ("this task's criteria take the answered revision
  number as given"); no criterion describes this relation.
not_applicable:
- edge_case: Two saves racing against each other, or a second submit while one is already pending.
  why: The double-submit guard (isSubmittingRef) is listed as preserved, untouched by this task, and is
    already proven by the existing suite's own "issues exactly one POST when Save is clicked twice in
    quick succession" test; this task introduces no new behavior over that guard.
- edge_case: The draft case version failing to load, or the screen opening on a case with no draft at
    all.
  why: Out of this task's scope per its own REMAINDER note (belongs to the task delivering create-draft
    and its refusal, and to rules/knowledge/a-case-has-at-most-one-draft); the loading and load-error
    phases are untouched by this task and already proven by the existing suite.
- edge_case: A hypothesis manifested more than once in the same draft case version.
  why: Excluded by this task's own REMAINDER note over rules/knowledge/a-hypothesis-is-manifested-at-most-once-in-a-case-version;
    the criteria rest on that invariant rather than proving it, and nothing in this task's files could
    enforce or violate it.
---

## What it is
Every criterion of the task: the offer withheld when the answered revision equals the captured pin, the offer made when it is higher or when no entry existed, the saved-revision message stated unconditionally in both branches, the offer's navigation target, three repeated no-op saves, and that the comparison reads only the two revision numbers and nothing distinguishing an overwrite from a created revision. A hook-level test also proves the pin compared against is the one captured before the save rather than one re-read from the cache afterward.

## Notes
`use-hypothesis-revision-form.test-support.ts` gained a backward-compatible addition -- `createWrapper`'s return now also exposes `queryClient` -- needed only by the new hook-level test to mutate the cached case-version manifest mid-flight; every existing caller is unaffected.
