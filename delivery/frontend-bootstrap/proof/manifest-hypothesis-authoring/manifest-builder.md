---
title: Proof for the Manifest Builder's reorder and remove screen
summary: Nineteen tests over VersionManifestScreen, split across four spec files sharing one test-support
  module, plus one targeted addition to api-client.spec.ts, proving all ten criteria, the isBusy/confirmation-dialog
  inferences the implementation discloses, and the load/error and generic-failure edges those criteria
  do not name.
implementation: sha256:c6f1fa3d57d5299f36dd1fcdaff660750f39f72a93571c5502c73914a9ecb4e3
run: run/manifest-hypothesis-authoring-onda-4-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/version-manifest-screen-load.spec.ts
  name: shows a loading placeholder before the draft version's own manifest arrives
  proves: the edge case of a dependency (the GET) answering slowly -- the implementation's own "loading"
    phase renders "Loading manifest…" rather than an empty or broken screen
  fails_when: the loading text is absent, or the table renders, while the GET is still pending
- file: src/routes/version-manifest-screen-load.spec.ts
  name: shows a failure placeholder with a retry action when loading the manifest fails
  proves: the edge case of a dependency (the GET) failing for a reason none of this task's criteria name
  fails_when: the failure text or the Retry button is absent after the GET rejects
- file: src/routes/version-manifest-screen-load.spec.ts
  name: renders every manifest entry ordered by its own declared position, with its own hypothesis name
    and revision number, regardless of the response's own array order
  proves: Visiting an existing draft version's manifest route renders every manifest entry from GET .../versions/{version}'s
    own manifest, ordered by its declared position, each showing its own hypothesis name and referenced
    revision number.
  fails_when: the rendered row order follows the response's own array order instead of the declared position
    field, or any row's text differs from "{name} · rev {revision}"
- file: src/routes/version-manifest-screen-load.spec.ts
  name: disables the up control on the lowest-position entry and the down control on the highest-position
    entry, leaving the middle entry's both enabled
  proves: The up control is disabled on the entry holding the lowest position, and the down control is
    disabled on the entry holding the highest position.
  fails_when: the lowest entry's up control is enabled, the highest entry's down control is enabled, or
    the middle entry's up or down control is disabled
- file: src/routes/version-manifest-screen-load.spec.ts
  name: renders + Add hypothesis as a router Link to the New Hypothesis route for the current case and
    draft version
  proves: '"+ Add hypothesis" navigates to the New Hypothesis route for the current case and draft version.
    (the resolved-href half)'
  fails_when: the link's own href differs from "/cases/{slug}/versions/{version}/manifest/hypotheses/new"
- file: src/routes/version-manifest-screen-load.spec.ts
  name: actually navigates to the New Hypothesis route's own path when clicked
  proves: '"+ Add hypothesis" navigates to the New Hypothesis route for the current case and draft version.
    (the click-driven navigation half)'
  fails_when: clicking the link does not change the router's own location to that path
- file: src/routes/version-manifest-screen-reorder.spec.ts
  name: issues one PUT naming the neighbor's own current position when an enabled up control is clicked,
    and a 204 re-renders the list in the new order
  proves: Clicking an enabled up or down control issues PUT .../manifest/{hypothesis_name} naming the
    target position, and a 204 response re-renders the list in the new order.
  fails_when: more or fewer than one PUT fires, the body carries a position or revision other than the
    neighbor's own current position and the row's own unchanged revision, or the rendered order does not
    reflect the refetched manifest after the 204
- file: src/routes/version-manifest-screen-reorder.spec.ts
  name: succeeds when the target position currently belongs to a different entry, without any client-side
    pre-check or blocking
  proves: Moving a hypothesis onto a position no other entry currently holds succeeds even though that
    position belonged to a different entry before the move; landing on a free position is never treated
    as a collision.
  fails_when: the PUT does not fire (a client-side occupancy guard refuses it), an inline blocked-move
    message appears despite the 204, or the reordered list does not reflect the move
- file: src/routes/version-manifest-screen-reorder.spec.ts
  name: reverts the attempted move and renders an inline message on the affected row when the PUT answers
    409 ManifestPositionOccupiedError, leaving the other rows unaffected
  proves: A 409 ManifestPositionOccupiedError response to that PUT reverts the attempted move and renders
    an inline message on the affected row.
  fails_when: the message is absent from the affected row, appears on an unaffected row instead, the list
    order changes despite the 409, or the row's own controls stay stuck disabled afterward
- file: src/routes/version-manifest-screen-reorder.spec.ts
  name: disables every row's controls while a move is pending, so a second click cannot fire a second
    request, and re-enables them once it resolves
  proves: the hook's own disclosed isBusy inference, and the edge case of two operations against one subject
    at once
  fails_when: an unrelated row's own control stays enabled while a move is pending, a second click issued
    during that window reaches the handler and fires a second PUT, or the controls stay disabled once
    the pending move resolves
- file: src/routes/version-manifest-screen-reorder.spec.ts
  name: returns the controls to an interactive, unblocked state when the PUT fails for a reason none of
    this task's criteria name
  proves: the edge case of a dependency (the PUT) failing in a way none of this task's ten criteria name
  fails_when: the row's own controls stay disabled after the non-domain failure, or the conflict banner's
    title text appears
- file: src/routes/version-manifest-screen-remove.spec.ts
  name: disables Remove and carries the stated tooltip when the manifest holds exactly one entry
  proves: The Remove control carries the tooltip "A case must keep at least one hypothesis" and is disabled
    exactly when the manifest holds one entry. (the one-entry, disabled-and-tooltipped half)
  fails_when: the Remove control is not disabled on a one-entry manifest, or focusing its own tooltip
    trigger never surfaces that exact text
- file: src/routes/version-manifest-screen-remove.spec.ts
  name: enables Remove and carries no tooltip when the manifest holds more than one entry
  proves: The Remove control carries the tooltip "A case must keep at least one hypothesis" and is disabled
    exactly when the manifest holds one entry. (the multi-entry half, and the inference that the tooltip
    pairs only with the disabled state)
  fails_when: the Remove control is disabled on a multi-entry manifest, or the tooltip text ever surfaces
    on an enabled Remove control
- file: src/routes/version-manifest-screen-remove.spec.ts
  name: opens a confirmation dialog on Remove without issuing the DELETE, and Cancel closes it without
    ever issuing one
  proves: the implementation's own disclosed EDG-04 inference -- a confirmation dialog sits between clicking
    Remove and the DELETE actually firing
  fails_when: the DELETE fires before the dialog is confirmed, no dialog appears on the Remove click,
    or Cancel issues a DELETE or fails to close the dialog
- file: src/routes/version-manifest-screen-remove.spec.ts
  name: issues one DELETE against that hypothesis's own manifest entry once the confirmation dialog is
    confirmed, and a 204 removes it from the list
  proves: Clicking an enabled Remove control issues DELETE .../manifest/{hypothesis_name}, and a 204 response
    removes that entry from the list.
  fails_when: more or fewer than one DELETE fires against the wrong or right URL, or the entry is still
    rendered after the 204
- file: src/routes/version-manifest-screen-remove.spec.ts
  name: reloads the manifest from the real GET rather than trusting the client's own removed-entry state
    when the DELETE answers 422 ManifestWouldHoldNoHypothesisError
  proves: A 422 ManifestWouldHoldNoHypothesisError response to that DELETE reloads the manifest from GET
    .../versions/{version} rather than trusting the client's own removed-entry state.
  fails_when: no additional GET fires after the 422, or the entry the server never actually removed is
    missing from the render
- file: src/routes/version-manifest-screen-conflict.spec.ts
  name: renders the conflict banner and disables every reorder and remove control when a reorder's own
    PUT answers 409 CaseVersionNotDraftError
  proves: A 409 CaseVersionNotDraftError response to either the PUT or the DELETE renders the conflict
    banner and disables every reorder and remove control on the screen. (the PUT-triggered half)
  fails_when: the banner's exact title or message is missing, or any row's up, down or Remove control
    stays enabled after the 409
- file: src/routes/version-manifest-screen-conflict.spec.ts
  name: renders the conflict banner and disables every reorder and remove control when a removal's own
    DELETE answers 409 CaseVersionNotDraftError
  proves: A 409 CaseVersionNotDraftError response to either the PUT or the DELETE renders the conflict
    banner and disables every reorder and remove control on the screen. (the DELETE-triggered half)
  fails_when: the banner's exact title or message is missing, or any row's up, down or Remove control
    stays enabled after the 409
- file: src/services/api-client.spec.ts
  name: resolves without throwing on a 204 response, never attempting to parse an empty body
  proves: this task's own disclosed api-client.ts divergence -- apiFetch special-cases a 204 status and
    returns without calling response.json(), which both PUT/DELETE manifest endpoints this task calls
    answer with
  fails_when: apiFetch rejects (or throws a SyntaxError) instead of resolving to undefined for a 204 response
    with no body
not_applicable:
- edge_case: absent or empty input (an empty manifest)
  why: rules/knowledge/a-case-has-at-least-one-hypothesis forbids a case version from ever holding zero
    hypotheses, so GET .../versions/{version} can never answer a manifest of length zero for this screen
    to render
untested:
- clicking Retry after a load failure actually triggers a refetch of the manifest -- the retry button's
  presence and label are proven, but the callback's own effect is not exercised (mirrors this same gap
  already recorded in delivery/frontend-bootstrap/proof/version-editor/edit-draft-version.md for its own
  Retry control)
- the exact user-facing wording of a move or remove failure that names none of this task's ten criteria
  (toast.error's own copy) -- untestable from this screen's own render tree in isolation, since the shared
  Toaster is mounted at the app shell and not part of the router this proof builds
- that the one GET and the isolated PUT/DELETE calls this screen issues are the only requests it ever
  makes -- the fetch stub throws on any unregistered URL, which is the only way an unexpected extra request
  would surface here
- the exact wording of the confirmation dialog's own title and description -- the dialog's presence, its
  Cancel/confirm behavior and its gating of the DELETE are proven; this task's own criteria and Notes
  name no wording for either
- the reuse of errorStateKind from use-edit-draft-version-form.ts rather than a second, parallel classification
  -- not given its own test since it carries no independently observable behavior beyond what the 409/422
  tests above already exercise
---

## What it is
Nineteen tests over VersionManifestScreen, split across three spec files (load/ordering, reorder, remove) plus a fourth for the CaseVersionNotDraftError conflict path, sharing version-manifest-screen.test-support.ts, plus one targeted addition to the existing api-client.spec.ts.

## Notes
Two real bugs surfaced and were fixed by the implementation while writing this proof's own tests: apiFetch's 204-handling (disclosed as a divergence in the implementation record) and a dual-React-copy crash from TUI's Tooltip/Dialog resolving their own third-party dependencies' "react" import to TUI's own separately-installed copy (also disclosed as a divergence, fixed via vite.config.ts aliases/inline plus an environment-level node_modules symlink). Both are exercised indirectly by every test in this file that interacts with a Tooltip or a Dialog (none of them would run at all otherwise) and directly by the one added api-client.spec.ts test for the 204 case.
One test-authoring correction made after first writing this proof: the criterion-7 removal test originally mocked a single, unchanging GET response for the manifest; since the implementation removes an entry by invalidating and refetching the manifest query (never by removing the row from local state directly), the mock now uses the same sequentialGetHandler pattern the reorder tests already established, returning the two-entry manifest on the first call and the post-removal one-entry manifest on the second.
A second correction: the disabled-Remove tooltip test originally used findByText/getByText, which throws when more than one element matches; Radix Tooltip renders both the positioned, visible tooltip content and a visually-hidden live-region copy of the same text for screen readers, a real and intentional duplication rather than a bug, so the test now asserts at least one match via findAllByText instead.
