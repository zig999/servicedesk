---
title: Release a draft case version — proof
summary: Tests proving task/version-editor/release-draft-version's eight criteria and its disclosed inferences,
  written against use-edit-draft-version-form.ts and case-version-editor-ready-view.tsx without touching
  either.
implementation: sha256:bd095e3bc4cb057ba14da64a303c1e9083e81d6f1e6029dca2e72a5aa2594b36
run: run/version-editor-onda-5-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: CaseVersionEditorScreen — the Release… control's own visibility (criterion 1) > renders the Release…
    control once the loaded version's own state is draft
  proves: The Version Editor renders a "Release…" control only while the currently loaded version's own
    state is draft.
  fails_when: the Release… control fails to render (or renders disabled/absent) once the loaded version's
    own state is "draft".
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: CaseVersionEditorScreen — the Release… control's own visibility (criterion 1) > renders no Release
    control when the loaded version's own state is released
  proves: The Version Editor renders a "Release…" control only while the currently loaded version's own
    state is draft.
  fails_when: the Release… control renders (or remains queryable) for a loaded version whose own state
    is "released".
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: CaseVersionEditorScreen — the Release… control's own visibility (criterion 1) > renders no Release
    control when the loaded version carries no state field at all
  proves: 'the implementation''s own inference: a CaseVersionRecord with no state/manifest field is treated
    as "not currently draft" — Release simply does not render there.'
  fails_when: the control renders (treating an absent state as though it were "draft") for a record carrying
    no state field.
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: CaseVersionEditorScreen — the Release… control's own visibility (criterion 1) > disables the Release
    trigger while a Save to the same version is in flight
  proves: the isBlocked gate criterion 5 names for a released version also reaches the Release trigger
    while a Save to the same version is in flight, so Save and Release cannot race against one subject
    at once.
  fails_when: the Release… trigger stays enabled (clickable) while a PATCH to the same version is pending.
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: CaseVersionEditorScreen — opening the Release Dialog (criteria 2 and 3) > opens an in-place Dialog
    (no navigation) listing exactly the three checklist items, every one satisfied by already-loaded data
  proves: Clicking "Release…" opens an in-place TUI Dialog (no navigation) listing a checklist computed
    from already-loaded data... / That checklist never renders a capability-readiness item, since no capability
    data is read by this task.
  fails_when: the route changes when the Dialog opens, the Dialog lists any count of items other than
    exactly three, an item's label does not match the three stated checks, or an item that should be satisfied
    is marked otherwise.
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: CaseVersionEditorScreen — opening the Release Dialog (criteria 2 and 3) > closes the Dialog and
    issues no request when Cancel is clicked
  proves: The Dialog's Cancel control closes it without issuing any request.
  fails_when: Cancel leaves the Dialog open, or any POST to the release endpoint is observed after clicking
    it.
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: CaseVersionEditorScreen — opening the Release Dialog (criteria 2 and 3) > disables the Dialog's
    own Cancel control while a confirm is in flight
  proves: 'the implementation''s own inference: the Dialog''s Cancel control is additionally disabled
    while a confirm is in flight (isConfirming).'
  fails_when: Cancel stays enabled while the release POST is pending.
- file: src/routes/case-version-editor-screen-release-control.spec.ts
  name: CaseVersionEditorScreen — opening the Release Dialog (criteria 2 and 3) > never styles the Release
    trigger or its Dialog confirm as the destructive variant
  proves: 'the implementation''s own inference: Release''s trigger/confirm use TUI''s default (primary)
    Button variant, never "destructive".'
  fails_when: either the trigger or the Dialog's own confirm button carries the destructive variant's
    class.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: CaseVersionEditorScreen — the checklist's own manifest item (criterion 2, empty manifest) > marks
    the manifest item unsatisfied with a zero count on an empty manifest, while the concept item stays
    satisfied vacuously
  proves: 'Clicking "Release…" opens an in-place TUI Dialog... listing a checklist computed from already-loaded
    data: whether the manifest holds at least one entry, with its count...'
  fails_when: the manifest item shows a nonzero count or reads satisfied on an empty manifest, or a fourth
    item appears, or the vacuously-true concept item is marked unsatisfied.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: CaseVersionEditorScreen — the checklist's own fallback-terms item (criterion 2, re-reading the
    glossary) > re-reads GET /v1/glossary/outcome when the Dialog opens, and marks the fallback item unsatisfied
    once the fallback's own outcome term is no longer offered
  proves: '...whether the loaded fallback''s own outcome, action and recipient terms still exist by re-reading
    GET /v1/glossary/outcome..., together with the implementation''s own inference that opening the Dialog
    explicitly calls .refetch() on the four glossary/concept queries.'
  fails_when: the fallback item stays satisfied despite the freshly re-read outcome vocabulary no longer
    offering the fallback's own term, or GET /v1/glossary/outcome is observed only once.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: CaseVersionEditorScreen — the checklist's own concept item (criterion 2, rules/knowledge/a-concept-accepts-the-declared-subject-type)
    > marks the concept item unsatisfied when a re-read concept no longer accepts the version's own subject,
    independently of the other two items
  proves: '...whether every manifested hypothesis-revision''s collected concepts accept the version''s
    own subject by re-reading GET /v1/glossary/concepts.'
  fails_when: the concept item stays satisfied despite the re-read concept's own accepts list excluding
    the version's subject, or the other two items change because of it.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: CaseVersionEditorScreen — the checklist's own concept item (criterion 2, rules/knowledge/a-concept-accepts-the-declared-subject-type)
    > marks the concept item unsatisfied, never a distinct fourth item, when a manifested concept no longer
    exists at all in the freshly re-read glossary
  proves: 'the implementation''s own inference: a collected concept the freshly re-read glossary no longer
    holds by name counts as "does not accept the subject" for the checklist''s third item, not a separate
    fourth item.'
  fails_when: a fourth item appears for the missing concept, or the third item stays marked satisfied
    despite the concept being entirely absent from the re-read glossary.
- file: src/routes/case-version-editor-screen-release-checklist.spec.ts
  name: CaseVersionEditorScreen — a checklist dependency that never successfully reads > treats a checklist
    dependency that fails every read as unsatisfied rather than crashing the Dialog
  proves: the checklist criterion 2 dependency on GET /v1/glossary/concepts degrades to "unsatisfied"
    rather than crashing the Dialog when that dependency never answers.
  fails_when: the Dialog fails to render (throws) when the concepts read never succeeds, or the concept
    item is marked satisfied despite the dependency never having answered.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: CaseVersionEditorScreen — confirming Release (criterion 4) > issues exactly one POST to .../release
    with no body when Release is confirmed
  proves: Confirming Release in the Dialog issues exactly one POST /v1/cases/{slug}/versions/{version}/release
    request with no body.
  fails_when: more than one POST is issued, the wrong URL/method is used, or the request carries a body.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: CaseVersionEditorScreen — confirming Release (criterion 4) > issues exactly one POST even when
    Release is confirmed twice in quick succession
  proves: Confirming Release in the Dialog issues exactly one POST... held against two confirmations of
    one subject at once.
  fails_when: two POSTs to the release endpoint are observed from the two rapid clicks.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: 'CaseVersionEditorScreen — a 200 response to Release (criterion 5) > moves the loaded version
    to released: hides the Release control and disables every field and Save'
  proves: A 200 response to that POST moves the loaded version's own state to released and disables every
    field and the Save control the form renders.
  fails_when: the Release… control remains queryable, or the Title field or the Save button stay enabled,
    after a 200 response.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: CaseVersionEditorScreen — a 422 CaseVersionNotReleasableError response (criterion 6) > renders
    every violation the response's own array holds, verbatim, in place of the checklist
  proves: A 422 CaseVersionNotReleasableError response renders every string the response's own violations
    array holds, together and verbatim, in place of the pre-click checklist, together with the implementation's
    own inference that a role="alert" div wraps the 422 violations list.
  fails_when: the checklist still renders instead of the violations, a violation string is altered/omitted/duplicated,
    the count of rendered violations differs from the response's own array, or the list is not exposed
    through role="alert".
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: CaseVersionEditorScreen — a 422 CaseVersionNotReleasableError response (criterion 6) > renders
    an empty violations view rather than the checklist when the response's own violations array is empty
  proves: A 422 CaseVersionNotReleasableError response renders every string the response's own violations
    array holds... held against the empty-array edge case.
  fails_when: the checklist reappears instead of an (empty) violations view, or the Dialog crashes on
    an empty violations array.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: CaseVersionEditorScreen — a 409 CaseVersionNotDraftAtReleaseError response (criterion 7) > closes
    the Dialog and re-fetches the version rather than showing a violations list, resetting for the next
    open
  proves: A 409 CaseVersionNotDraftAtReleaseError response closes the Dialog and re-fetches the version
    rather than showing a violations list.
  fails_when: the Dialog stays open or shows a violations list on a 409, the version is not re-fetched,
    or reopening the Dialog afterward shows stale violations instead of the checklist.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: CaseVersionEditorScreen — resetting the Dialog after Cancel closes a violations view > shows the
    checklist again, never the previous violations list, once Cancel closes a Dialog that had shown a
    422's violations
  proves: The Dialog's Cancel control closes it without issuing any request. held against a Dialog that
    was showing a 422's violations, so Cancel's own reset is proven independently of the 409 branch's
    own reset.
  fails_when: reopening the Dialog after Cancel closed a violations view still shows the previous violations
    rather than the checklist.
- file: src/routes/case-version-editor-screen-release-outcomes.spec.ts
  name: CaseVersionEditorScreen — a Release failure outside 409 and 422 > leaves the Dialog open with
    the checklist intact and the confirm control usable again
  proves: a Release failure the task's own three named outcomes (200/409/422) do not cover leaves the
    Dialog usable rather than stuck or silently broken.
  fails_when: the Dialog closes, the checklist disappears, or the confirm control stays stuck disabled
    after a failure outside 409/422.
not_applicable:
- edge_case: a numeric boundary beyond "zero entries" versus "at least one entry" in the manifest count
  why: criterion 2 states only the zero/at-least-one distinction for the manifest item; no criterion or
    bound node states a second threshold to test against.
- edge_case: a duplicate manifest entry or a duplicate violation string
  why: no criterion or bound node claims uniqueness over the manifest's own entries or the 422 response's
    own violations array — nothing here would fail differently for a duplicate than for any other entry.
- edge_case: editing a form field while the Release Dialog is open
  why: no criterion or inference states an interaction between the open Dialog and the form's own fields;
    each is independently gated (canRelease/isBlocked) with nothing in the task binding the two together.
untested:
- 'record.state settling to "released" purely from the invalidated GET''s own refetch, independent of
  the sticky isReleased flag, is not observed in isolation: every 200-success assertion above passes because
  isReleased alone already gates isBlocked/canRelease, so a version that failed to actually persist as
  released server-side but still returned 200 would not be caught by this proof.'
- the Release Dialog's own title ("Release v{version}?") and description ("Once released, this version
  and every manifest entry it holds are frozen — permanently.") are never asserted verbatim, since that
  copy is disclosed as the implementation's own inference from the wireframe rather than a stated criterion
  this proof is scoped to bind.
---

## What it is
Twenty tests across three spec files (plus a shared test-support module) over CaseVersionEditorScreen, proving the Release control's own visibility gate, the pre-release checklist's three items, all three POST outcomes (200/409/422), and the Cancel control.

## Notes
No test asserts telemetry.caseReleased or the two query-cache invalidations directly: neither is externally observable behavior a curator can see, and binding a test to how the hook is built rather than to what it does would make the test brittle to a refactor that changes nothing a criterion states.
