---
title: Repin offer conditioned on whether the save moved the draft's pin
summary: The hypothesis-editing screen's success surface now offers the manifest-builder step only where
  the revision the save answered differs from the revision the draft's manifest entry pinned going into
  that save.
task: sha256:08b1f44f3b51c3d325844cf01983d21bb35a8df85e9f1ba911cdd0a7ec5c60eb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-repin-affordance-repin-offered-only-when-the-pin-fell-behind-build-3
files:
- path: src/hooks/use-hypothesis-revision-form.ts
  effect: Captures the draft's manifest-entry pinned revision for the hypothesis being revised immediately
    before each revise mutation (via a ref set in the mutation's onMutate), and on success compares the
    answered revision number against that captured pin to compute a new offerManifestBuilder boolean on
    the "success" phase state; onOpenManifestBuilder and the rendered revision number are otherwise unchanged.
- path: src/routes/hypothesis-revision-screen.tsx
  effect: Renders the "Open Manifest Builder" button only when the success state's offerManifestBuilder
    is true; the success message stating the saved revision number is rendered unconditionally as before.
criteria:
- criterion: After a save answering the same revision number the draft's manifest entry pinned going into
    it, the screen offers no manifest-builder step.
  met: true
  how: offerManifestBuilder is computed false when the answered revision equals the pin captured in onMutate,
    and hypothesis-revision-screen.tsx renders the button only when that flag is true.
- criterion: After a save answering the same revision number the draft's manifest entry pinned going into
    it, the screen still states that the hypothesis was saved as that revision number.
  met: true
  how: The success message rendering the saved name and revision number is unconditional and unchanged
    by this task; only the button's visibility is gated.
- criterion: After a save answering a revision number higher than the one the draft's manifest entry pinned
    going into it, the screen offers the manifest-builder step.
  met: true
  how: offerManifestBuilder is computed true when the answered revision is strictly greater than the captured
    pin.
- criterion: Activating the offered step navigates to the manifest of the draft case version the screen
    was opened on, at the same route it navigates to today.
  met: true
  how: onOpenManifestBuilder's navigation target (/cases/$slug/versions/$version/manifest) is unchanged;
    only the button's rendering is now conditioned on offerManifestBuilder.
- criterion: After a save of a hypothesis that had no entry in the draft case version's manifest, the
    screen offers the manifest-builder step.
  met: true
  how: offerManifestBuilder is computed true when the captured pin is null (no manifest entry existed
    for the hypothesis before the save).
- criterion: Three successive saves that each answer the revision number the draft's manifest entry pins
    leave the screen offering no manifest-builder step after each of them.
  met: true
  how: Each mutation's onMutate re-captures the current pin from the cached case-version query immediately
    before that save, so the comparison is re-evaluated fresh on every submission rather than once; three
    in-place overwrites each compare an unchanged pin against an unchanged answer and each computes false.
- criterion: The screen decides the offer from the two revision numbers alone, and offers the step where
    the answered revision is higher even though the save's answer carries no field distinguishing an overwrite
    from a created revision.
  met: true
  how: The comparison reads only the captured pinned revision and the mutation response's revision field;
    the RevisedHypothesis response type carries no field naming the branch, and none is read or introduced.
nodes:
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  how: 'The hook captures the manifest entry''s pinned revision for the hypothesis under revision immediately
    before the revise mutation runs (mutationFn''s onMutate reads the same cached ["case-version", slug,
    version] manifest the "ready" phase already reads for pinnedRevision), then compares it against the
    revision number the mutation''s own success response answers. The success-phase state exposes exactly
    the two-way read the rule states: offerManifestBuilder is true where the captured pin was null (no
    entry) or where the answered revision is strictly higher, and false only where the answered revision
    equals the pin -- no third relation is coded because none exists.'
- node: rules/knowledge/a-revise-answers-the-revision-number-it-saved
  encoded_at:
  - src/routes/hypothesis-revision-screen.tsx
  how: Unchanged by this task -- the success message ('Hypothesis "<name>" saved as revision <revision>.')
    was already rendered unconditionally in both branches before this task and remains so; this task only
    reads that same already-answered revision number as one side of the comparison that decides the offer,
    without altering what is stated to the curator.
inferences:
- inferred: The revision compared against the answered save is captured explicitly at the moment the revise
    mutation starts (a ref set in onMutate, reading the same cached case-version manifest the sibling
    task's pinnedRevision already reads), rather than re-derived from that same query's data when the
    success phase later renders.
  from: The sibling task pinned-revision-in-hand-before-a-save's own notes left open whether the held
    value must be re-read at the revise or may be the one loaded at open, and the revise mutation never
    invalidates or refetches the case-version query, so both readings would answer identically for every
    criterion here; the explicit capture was chosen to match this rule's own wording ("held immediately
    before the revise") without depending on that query's cache staying untouched between the click and
    the success render for reasons outside this hook's control.
preserved:
- The success phase's textual confirmation of the saved hypothesis name and revision number is rendered
  in every case, exactly as before, regardless of whether the manifest-builder step is offered.
- The POST body shape ({ hypothesis_name, criterion, collects, resolution, subject }) and the double-submit
  guard (isSubmittingRef) are untouched.
- onOpenManifestBuilder's navigation target (/cases/$slug/versions/$version/manifest) is unchanged whenever
  the button is shown.
- The loading, load-error and ready phases, and the "ready" phase's own pinnedRevision field delivered
  by the sibling task, are untouched; this task reads the same underlying manifest data through an independently
  captured ref rather than modifying that field.
---

## What it is
The hypothesis-editing screen's success surface comparing the revision the revise mutation answered against the revision the draft's manifest entry pinned for that hypothesis immediately before the mutation ran, and offering the "Open Manifest Builder" step only where those two numbers differ or where the draft held no entry at all.

## Notes
The saved revision number is still stated to the curator unconditionally, in both branches, exactly as before this task; only the manifest-builder step's visibility is now conditioned on the comparison.
The comparison depends on the draft's manifest-entry pinned revision already being in hand before the save, which the sibling task pinned-revision-in-hand-before-a-save delivered as the "ready" phase's pinnedRevision field; this task reads that same underlying cached case-version query independently, at the moment the mutation starts, rather than reusing that field's own value at render time.
No test file previously asserted a conditional manifest-builder affordance; the proof step introduces that assertion.
