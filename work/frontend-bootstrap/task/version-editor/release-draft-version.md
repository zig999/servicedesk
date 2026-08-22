---
title: Release a draft case version
summary: Adds the "Release…" control to the Version Editor, opening an in-place confirmation Dialog with a client-computed pre-release checklist, then turning the draft permanently read-only via POST .../release or rendering every violation the backend's own 422 response names.
rationale: >-
  Kept separate from discard-draft-version because the two are different falsifiable outcomes with
  different reasons to change: release turns a version irreversibly read-only behind a validation
  checklist and a violations vocabulary discard never touches, while discard erases the version and
  its manifest outright behind a slug-typed confirmation release never needs -- each is
  independently demonstrable without the other having shipped.

  I resolved the epic's own open decision in favor of an in-place TUI Dialog rather than navigating
  to the already-registered "/cases/$slug/versions/$version/release" placeholder route: the
  wireframe draws Release as a centered modal overlaying the editor, not a full-page transition, and
  the one precedent this tree already establishes for a destructive confirmation --
  task/manifest-hypothesis-authoring/manifest-builder's own Remove flow -- is a Dialog with no
  navigation. That placeholder route, and VersionReleasePlaceholder behind it, stay exactly as
  unreachable as the inventory found them; this task does not retire them.

  I depend this task on edit-draft-version because the Release control and its Dialog extend that
  task's own screen and hook (use-edit-draft-version-form.ts) rather than building a new surface, and
  because the pre-release checklist re-derives data (the loaded fallback's own outcome/action/
  recipient, the manifest's already-loaded hypothesis-revisions and their collected concepts) that
  hook already reads.

  The checklist's own three items are exactly what the scope's finding #3 names as client-derivable
  today (manifest non-empty, fallback's own terms still in the glossary, every collected concept
  accepts the case subject); I did not add a fourth capability-readiness item, since finding #3
  states it is undecidable client-side without reading domain/integration/capability, which no task
  in this initiative touches. I chose to render the checklist as best-effort rather than a promise,
  per the scope's own instruction, and to render a 422 response's violations verbatim from its own
  `violations` array rather than reusing the checklist's fixed wording, per the scope's finding #2 --
  the two failure classes it describes never combine, so nothing here reconciles them into one text.
objective: Confirming "Release…" on a loaded draft case version persists that version's release via one POST /v1/cases/{slug}/versions/{version}/release request, turning the form permanently read-only on success and showing every violation the backend's own response names on structural or coherence failure.
criteria:
  - The Version Editor renders a "Release…" control only while the currently loaded version's own state is draft.
  - >-
    Clicking "Release…" opens an in-place TUI Dialog (no navigation) listing a checklist computed
    from already-loaded data: whether the manifest holds at least one entry, with its count;
    whether the loaded fallback's own outcome, action and recipient terms still exist by re-reading
    GET /v1/glossary/outcome, GET /v1/glossary/action and GET /v1/glossary/recipient; and whether
    every manifested hypothesis-revision's collected concepts accept the version's own subject by
    re-reading GET /v1/glossary/concepts.
  - That checklist never renders a capability-readiness item, since no capability data is read by this task.
  - Confirming Release in the Dialog issues exactly one POST /v1/cases/{slug}/versions/{version}/release request with no body.
  - A 200 response to that POST moves the loaded version's own state to released and disables every field and the Save control the form renders.
  - A 422 CaseVersionNotReleasableError response renders every string the response's own `violations` array holds, together and verbatim, in place of the pre-click checklist.
  - A 409 CaseVersionNotDraftAtReleaseError response closes the Dialog and re-fetches the version rather than showing a violations list.
  - The Dialog's Cancel control closes it without issuing any request.
implements:
  - contracts/glossary/glossary-query
  - contracts/knowledge/case-lifecycle
  - contracts/knowledge/case-query
  - domain/glossary/action
  - domain/glossary/concept
  - domain/glossary/outcome
  - domain/glossary/recipient
  - domain/glossary/subject-type
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/manifest-entry
  - domain/knowledge/referral
  - domain/knowledge/resolution
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/case-terms-exist-in-the-glossary
depends_on:
  - task/version-editor/edit-draft-version
sources:
  - intake/onda-5-scope.md
---

## What it is
The section 2.6 Release confirmation the scope describes, over the real POST .../release endpoint the scope's own backend finding confirms (no request body, 200/409/422 only).
The pre-release checklist the scope's finding #3 authorizes as client-side best-effort, reusing use-glossary-vocabulary.ts and use-concept-options.ts exactly as use-edit-draft-version-form.ts already does.
The 422 violations rendering the scope's finding #2 requires: verbatim from the response's own array, never a fixed three-line text.

## Notes
The two mutually-exclusive violation halves the scope's finding #2 describes (structural, then coherence) never need distinguishing in this task's own rendering: both arrive in the same `violations` array and are shown the same way regardless of which half produced them.
"/cases/$slug/versions/$version/release" (VersionReleasePlaceholder) stays unreachable and unretired by this task, per the epic's own Dialog-in-place decision.
rules/knowledge/a-case-version-is-written-once's own second clause (revising a case's content composes the next draft version instead) is not reached here: this task only ever moves a loaded draft to released, never starts a new draft from an already-released version. That clause belongs to the task that lets a curator revise an already-released case (new-draft-creation's own create-draft flow, already delivered).
