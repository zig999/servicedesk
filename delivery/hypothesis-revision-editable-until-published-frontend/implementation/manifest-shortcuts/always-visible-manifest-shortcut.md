---
title: Always-visible manifest shortcut on the hypothesis-editing screen
summary: The hypothesis-editing screen's ready phase now renders a control that navigates to the manifest
  of the case version it was opened on, reusing the hook's existing navigate-to-manifest call, while the
  save-success phase's conditional offer is left exactly as delivered.
task: sha256:7d943b13fb385b68e81e31f737c2b1dcd607a2d9f3dfa9614b0a95c0918a71d8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/manifest-shortcuts-always-visible-manifest-shortcut-build
files:
- path: src/hooks/use-hypothesis-revision-form.ts
  effect: 'Extracted the navigate-to-manifest call (previously built only inline in the success-phase
    return) into a single openManifest closure defined once per hook invocation, wired to the same navigate({
    to: "/cases/$slug/versions/$version/manifest", params: { slug, version: String(version) } }) call
    as before. The "ready" branch of the HypothesisRevisionFormState union gained a new readonly onOpenManifest:
    () => void field, populated from that same openManifest closure and returned alongside the screen''s
    other ready-phase state. The "success" branch''s onOpenManifestBuilder now points at the same openManifest
    closure instead of a second inline construction of the same navigate call; offerManifestBuilder''s
    pinned-vs-written comparison is untouched.'
- path: src/routes/hypothesis-revision-screen.tsx
  effect: The ready-phase JSX branch (the screen's final return, rendering HypothesisRevisionFormFields)
    now also renders a <Button type="button" onClick={state.onOpenManifest}>View Manifest</Button>, unconditionally,
    before the form fields. The load-error, loading and success-phase branches are untouched, including
    the success phase's existing state.offerManifestBuilder && conditional "Open Manifest Builder" button.
criteria:
- criterion: The hypothesis-editing screen in its ready phase, before any save has been made on it, renders
    a control whose target is the manifest route of the case version the screen was opened on.
  met: true
  how: 'The ready-phase JSX branch in hypothesis-revision-screen.tsx (reached only before reviseMutation.isSuccess,
    i.e. before any save has resolved) unconditionally renders a Button whose onClick is state.onOpenManifest,
    which calls navigate({ to: "/cases/$slug/versions/$version/manifest", ... }).'
- criterion: The control's target is built from the slug and version the screen was opened on, and names
    no other case version.
  met: true
  how: 'openManifest closes over the slug and version parameters useHypothesisRevisionForm was called
    with -- the same slug/version props HypothesisRevisionScreen received and passed through -- and builds
    params: { slug, version: String(version) } from them alone; no other slug or version value is read
    anywhere in the closure.'
- criterion: The control reuses the navigate-to-manifest call already built in use-hypothesis-revision-form.ts
    rather than a second construction of that route.
  met: true
  how: 'The navigate call that used to be constructed only inline inside the success-phase return is now
    built exactly once, in the openManifest closure defined near the top of useHypothesisRevisionForm;
    both the ready-phase''s onOpenManifest and the success-phase''s onOpenManifestBuilder are assigned
    that same closure reference -- no second navigate({ to: "/cases/$slug/versions/$version/manifest",
    ... }) literal exists anywhere in the file.'
- criterion: Rendering the control adds no request beyond the two reads the screen already issues.
  met: true
  how: openManifest only calls navigate; it reads no query and issues no apiFetch call. The ready-phase
    return that now carries onOpenManifest still depends on exactly the same two queries the phase already
    required to compute (versionQuery, revisionsQuery) -- no useQuery or useEffect was added.
- criterion: After a save whose answered revision equals the revision the draft's manifest entry pinned
    going into it, the screen still renders no post-save manifest-builder offer.
  met: true
  how: offerManifestBuilder's computation -- pinnedBeforeSave === null || revision > pinnedBeforeSave
    -- is unchanged; when the answered revision equals pinnedBeforeSave this evaluates to false, and the
    success-phase JSX's {state.offerManifestBuilder && (...)} still renders nothing for the "Open Manifest
    Builder" button. The ready-phase's always-visible "View Manifest" control is not rendered in the success
    phase at all (it lives only in the ready-phase branch), so no route to the manifest is offered on
    this branch either.
- criterion: After a save whose answered revision is higher than the revision the draft's manifest entry
    pinned going into it, the screen still renders the post-save manifest-builder offer.
  met: true
  how: Same unchanged offerManifestBuilder computation evaluates to true when revision > pinnedBeforeSave,
    and the success-phase JSX still renders the "Open Manifest Builder" button, now wired to the shared
    openManifest closure rather than a duplicate construction.
nodes:
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  how: The task's control targets /cases/$slug/versions/$version/manifest, the manifest route of one case
    version identified by the slug and version the screen was opened on -- the same aggregate this node
    names, addressed by the same identity (case reference plus version number) the node's relationships
    and attributes already establish. This task adds no new attribute, state or operation to the aggregate;
    it only wires a UI control to an address already valid under this node's shape.
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  encoded_at:
  - src/hooks/use-hypothesis-revision-form.ts
  - src/routes/hypothesis-revision-screen.tsx
  how: This task does not change when the rule's own post-save offer (offerManifestBuilder) appears --
    that computation and its two covered branches (written == pinned -> no offer; written > pinned ->
    offer) are left exactly as delivered, per criteria 5 and 6. The always-visible ready-phase control
    this task adds is a different, unconditional route to the same manifest, present only before a save
    is made -- it does not implement the rule's own offer/no-offer decision and is not rendered in the
    success phase where the rule's branches apply, so it does not reintroduce an offer on the branch the
    rule says offers none.
inferences:
- inferred: The always-visible "View Manifest" control renders only in the ready phase (before any save
    resolves) and is not also rendered in the success phase (after a save resolves), even though the task's
    summary describes it as present "at any point while editing."
  from: 'The task''s own ## Notes flags this as UNDERDETERMINED -- criteria 1 and 5 leave open whether
    the control should keep rendering through and after a save whose written revision equals the pinned
    one. Rendering it through that branch too would place a route to the draft''s manifest in front of
    the curator on exactly the branch rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
    says offers none, for the reason the rule''s own Description states: ''a step that is always available
    and never necessary teaches a curator to ignore it on the occasions it is necessary.'' Confining the
    always-visible control to the ready phase satisfies every stated criterion (1-6) without working against
    that stated reasoning.'
- inferred: The always-visible control's label reads "View Manifest", distinct from the success-phase
    offer's existing "Open Manifest Builder" label.
  from: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move's own Description
    states 'Which control carries the offer, its wording and where it sits are form and belong to the
    interface, not here' -- wording is unconstrained by any node. A distinct label was chosen because
    the two controls are semantically different (an always-present shortcut to view the manifest, versus
    a conditional post-save prompt to build/repin it), per the inventory hypothesis-revision-repin-affordance.md's
    rationale for keeping the two flows separate.
- inferred: The control is placed directly under the ready-phase heading, before HypothesisRevisionFormFields.
  from: hypothesis-revision-repin-affordance.md's Notes state the screen 'uses no StatusTable, so a control
    not tied to a phase has no existing slot on that screen' -- there being no existing slot, placement
    was chosen as the first element after the heading, the position requiring no rearrangement of the
    existing form-fields composition.
preserved:
- The success-phase's conditional "Open Manifest Builder" button and its offerManifestBuilder pinned-vs-written
  comparison, exactly as delivered -- unchanged logic, only its navigate call now shares the openManifest
  closure instead of constructing the route a second time.
- The load-error and loading phase branches of both the hook and the screen component.
- The two existing queries (versionQuery, revisionsQuery) and their loading/error gating -- no request
  was added or altered.
- use-hypothesis-revision-form.test-support.ts and hypothesis-revision-screen.test-support.ts fixtures,
  untouched by this record (test authorship is a separate judgment).
deferred:
- what: The rule's third branch -- "whenever that draft version's manifest holds no entry for the hypothesis
    at all" -- offering the post-save route.
  why: The task's own criteria 5 and 6 reach only the written==pinned and written>pinned branches; the
    task's Notes record this as UNDERDETERMINED and explicitly outside what its criteria ask for. Widening
    the success-phase offer logic to cover the missing-entry branch is not something this task's criteria
    state, and doing so would be widening the task beyond what was planned.
---

## What it is
The hypothesis-editing screen's ready phase (before any save) now shows a "View Manifest" control that navigates to the case version's manifest, sharing the same navigate call the save-success phase's conditional "Open Manifest Builder" already used.

## Notes
None.
