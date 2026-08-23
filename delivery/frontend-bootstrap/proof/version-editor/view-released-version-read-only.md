---
title: Proof for viewing a released case version read-only
summary: Tests the Versions tab's new "View" action on a released row, its absence-preserving behavior
  on a draft row, and the Version Editor's control-free read-only render of a released version's fields
  and manifest.
implementation: sha256:acb2448288651e046961f625588da125fe414c581ec2fddf869673ec612574ab
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/version-editor-view-released-version-read-only-suite
tests:
- file: src/routes/case-detail-screen-view-released-action.spec.ts
  name: renders a View action on a released version's row, where today it renders none
  proves: A released version's row in the Versions tab renders a "View" action, where today it renders
    none.
  fails_when: actionsForRow() stops rendering a "View" Link for a row whose state is not "draft" -- e.g.
    it reverts to rendering nothing, or renders a different label.
- file: src/routes/case-detail-screen-view-released-action.spec.ts
  name: renders only Continue editing on a draft version's row, never a View action
  proves: A draft version's row continues to render only "Continue editing", never a "View" action.
  fails_when: a draft row's actions cell renders anything other than exactly one "Continue editing" link
    -- e.g. it also renders "View", or renders neither.
- file: src/routes/case-detail-screen-view-released-action.spec.ts
  name: navigates to the released version's own route, issuing no request beyond the versions-list load
    already made
  proves: Clicking "View" navigates to that version's own route, performing no additional request beyond
    the load the route itself triggers.
  fails_when: the View link's href stops resolving to "/cases/{slug}/versions/{version}", or clicking
    it issues any fetch beyond the one GET that already loaded the row -- e.g. a confirmation or pre-check
    request fired before navigating.
- file: src/routes/case-version-editor-screen-view-released.spec.ts
  name: renders title, when_to_use, subject, fallback outcome/referral and consolidation_register from
    the GET response, each disabled
  proves: Loading a version whose state is released renders its title, when_to_use, subject, fallback
    outcome/referral and consolidation_register fields, each disabled, from GET /v1/cases/{slug}/versions/{version}.
  fails_when: any of those six fields stops rendering the loaded record's own value, or stops carrying
    disabled, once the record's own state is "released".
- file: src/routes/case-version-editor-screen-view-released.spec.ts
  name: shows no Save, Release… or Discard draft control when the loaded record's own state is already
    released
  proves: The read-only render shows no Save, "Release…" or "Discard draft" control. Jointly with case-version-editor-screen-release-outcomes.spec.ts's
    own untouched "moves the loaded version to released" test (which keeps Save present-but-disabled for
    a mid-session release), this also pins the implementation's own inference that isReadOnly is computed
    strictly from record.state rather than from isBlocked/isReleased.
  fails_when: Save, "Release…" or "Discard draft" renders (even disabled) for a version whose record.state
    already reads "released" at load.
- file: src/routes/case-version-editor-screen-view-released.spec.ts
  name: lists every manifest entry in the response's own order, each with its declared position, hypothesis
    name, revision and criterion
  proves: The read-only render lists every manifest entry the response returns, in the order the response
    returns them, each showing its declared position, its hypothesis's name, its hypothesis-revision's
    own revision number and criterion.
  fails_when: an entry is dropped, reordered (e.g. sorted by declared position instead of kept in the
    response's own order), or one of its four shown facts is wrong or missing.
- file: src/routes/case-version-editor-screen-view-released.spec.ts
  name: renders an explicit empty-manifest sentence rather than a header-only table when the response's
    own manifest is empty
  proves: the implementation's own recorded inference that an empty manifest array renders an explicit
    sentence rather than a bare table
  fails_when: an empty manifest instead renders a header-only table with nothing said about why, or renders
    nothing in its place at all.
- file: src/routes/case-version-editor-screen-view-released.spec.ts
  name: renders no Manifest section, and keeps Save present, for a draft version's own load even when
    its manifest already holds entries
  proves: that the manifest listing (and the omission of Save) are scoped to isReadOnly rather than to
    a manifest's mere presence -- the edge case this task's own new code path raises alongside the existing
    draft-editing surface.
  fails_when: a draft record whose read already carries a manifest also renders a "Manifest" section or
    a table, or stops rendering the Save control.
not_applicable:
- edge_case: The empty-manifest read-back refusal (CaseNotValidError) that case-query.service.ts's own
    coherence check can raise.
  why: A released version has already passed that check at release time and stays valid once released
    (the task's own Notes), so this render path never actually hits it; that refusal's own handling is
    case-attributes-at-a-glance's own concern for a still-incoherent draft.
- edge_case: Two curators viewing or navigating to the same released version's route at once.
  why: The render performs one read of already-immutable, backend-frozen content and offers no control
    that could change it, so there is nothing for two concurrent viewers to race over; no bound node states
    a guarantee about concurrent reads of a released version.
- edge_case: A manifest entry's hypothesis name uniqueness, its hypothesis-revision's own numbering/immutability,
    and whether the declared order is the precedence the experts affirmed.
  why: domain/knowledge/hypothesis and domain/knowledge/hypothesis-revision are deliberately outside this
    task's own implements (per its own rationale); this render trusts those facts exactly as the backend
    already validated and returned them, and manifest-hypothesis-authoring's own tasks test them.
- edge_case: The Discard control's typed-slug confirmation flow.
  why: canDiscard already reads false for a released record (record.state === "draft" is false), so the
    Discard control -- and everything inside its confirmation Dialog -- never mounts for this render;
    there is no confirmation flow to exercise here.
- edge_case: A released version's own GET response omitting manifest entirely (undefined) rather than
    returning an empty array.
  why: CaseVersionRecord's own manifest field is optional only for a freshly-created draft that has never
    been read back through the real GET (case-version-record.ts's own header comment); a version whose
    state is released was always read back through that GET, so manifest is always present there, and
    the ?? [] fallback the code carries defensively is unreachable for a released record in practice.
---

## What it is
Eight tests across two new spec files proving every one of this task's six criteria plus two edge cases the read-only render's own new code path raises.

## Notes
All ran clean on the first suite attempt (run/version-editor-view-released-version-read-only-suite); no earlier suite attempt failed.
