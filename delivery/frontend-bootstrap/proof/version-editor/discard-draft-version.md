---
title: Discard a draft case version — proof
summary: Sixteen behavioral tests over CaseVersionEditorScreen prove the Discard control's visibility
  gate, its slug-typed confirmation Dialog, the DELETE it issues, both terminal outcomes of that request,
  and the Dialog's own "Keep draft" control, against a self-contained router-and-fetch fixture confirming
  the slug prop threaded into CaseVersionEditorReadyView is live.
implementation: sha256:e6925862ac9fd207f5bcba7a56f4ba904db5b29b7d3119ad00b0e1a1a4ad5c22
run: run/version-editor-onda-5-full-suite
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
tests:
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: renders the Discard draft control once the loaded version's own state is draft
  proves: criterion 1 (positive) — the control renders while state === draft
  fails_when: the trigger is not rendered for a loaded draft version
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: renders no Discard control when the loaded version's own state is released
  proves: criterion 1 (negative) / rules/knowledge/only-a-draft-case-version-may-be-discarded
  fails_when: a Discard trigger renders for a released version
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: renders no Discard control when the loaded version carries no state field at all
  proves: the gate's own default-safe behavior — an absent state is never treated as draft (mirrors the
    analogous inference already proven for the Release control)
  fails_when: the control renders for a record carrying no state field
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: disables the Discard trigger while a Save to the same version is in flight
  proves: the trigger honors the same shared isBlocked gate the rest of the "ready" form already reads
  fails_when: the trigger stays enabled while a PATCH to the same version is pending
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: opens an in-place Dialog (no navigation) stating that hypotheses keep their content and only this
    draft and its manifest are removed
  proves: criterion 2, both halves — no route change, and the Dialog's own description text verbatim
  fails_when: opening the control changes the route, or the rendered description text differs from what
    the criterion states
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: keeps the confirm control disabled while the confirmation field is empty
  proves: criterion 3's baseline — nothing typed never satisfies the barrier
  fails_when: the confirm control is enabled with an empty confirmation field
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: keeps the confirm control disabled for a typed value that is not an exact match
  proves: the barrier's own exactness — case-sensitive and untrimmed, per discard-confirmation.ts's own
    documented comparison
  fails_when: a case-different or trailing-whitespace-padded typed value enables the confirm control
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: enables the confirm control once the confirmation field holds the slug typed exactly
  proves: criterion 3's positive case
  fails_when: typing the slug exactly still leaves the confirm control disabled
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: issues exactly one DELETE against this version with no body when confirmed with the slug typed
    exactly
  proves: criterion 4
  fails_when: the request carries a body, targets the wrong path/method, or is issued a number of times
    other than exactly one
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: issues exactly one DELETE even when confirm is clicked twice in quick succession
  proves: the mutation is not re-issued while one against the same version is already pending (concurrent-operation
    edge case)
  fails_when: two DELETE requests are issued
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: navigates the curator to that case's own Case Detail route
  proves: criterion 5
  fails_when: a 204 response does not navigate to /cases/{slug}, or navigates elsewhere
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: keeps the Dialog open and renders that error's own message on a 404 response, rather than navigating
    away
  proves: criterion 6
  fails_when: the Dialog closes, the route changes, or the backend's own message is not rendered verbatim
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: renders a generic fallback message, rather than none at all, when the DELETE fails outside the
    backend's own typed error envelope
  proves: the disclosed non-ApiError fallback inference (discardErrorMessage's GENERIC_DISCARD_FAILURE_MESSAGE
    branch)
  fails_when: no message, or a different message, renders for a raw network failure
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: closes the Dialog and issues no request when Keep draft is clicked
  proves: criterion 7
  fails_when: a DELETE is issued, or the Dialog stays open, after clicking Keep draft
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: disables Keep draft while a confirm is in flight
  proves: the Dialog's own secondary control stays consistent with the confirm control's own in-flight
    state, closing the same double-action window already proven for the confirm button
  fails_when: Keep draft stays clickable while a DELETE is pending
- file: src/routes/case-version-editor-screen-discard.spec.ts
  name: clears the typed confirmation and the previous error once the Dialog is closed and reopened
  proves: buildDiscardControlState's own reset-on-transition inference
  fails_when: a stale error message or a stale typed value survives into the next time the Dialog opens
not_applicable:
- edge_case: Boundary at each end of a stated range
  why: this task states no numeric range or size limit.
- edge_case: Empty/duplicate collection behavior
  why: this task returns and iterates over no collection.
- edge_case: Operating directly against a version-that-forbids-discard state (bypassing the hidden control)
  why: the client gates entirely by hiding the control per criterion 1; the server's own refusal in that
    case is a 4xx/409 the DELETE-outcome tests already cover generically as 'any error response'.
untested:
- 'new-case-draft-screen.tsx''s own mechanical slug-prop pass-through (the implementation record''s fourth
  inference) is not independently exercised by a test here: that screen renders through use-new-draft-version-form.ts''s
  own blank-form "ready" object, which never sets discard at all, so its own Discard-control absence is
  guaranteed by construction rather than by anything this task''s criteria state about that screen — and
  a missing/incorrectly-typed prop there would fail at compile time, not at the runtime layer these tests
  reach. No test here proves the prop is actually received end-to-end at that second call site; only case-version-editor-screen.tsx''s
  own call site is exercised (via the confirmation prompt''s own rendered slug text).'
- 'Telemetry (caseDraftDiscarded) and the two query-cache invalidations (["case-version", slug, discardedVersion],
  ["case-versions", slug]) the implementation record discloses as inferences mirroring releaseMutation''s
  own convention are not asserted by any test here: neither is observable behavior a curator can see on
  the wire, and asserting an internal QueryClient/telemetry call directly would bind the test to how the
  hook is built rather than to what it does — the tests instead prove the one externally observable consequence
  criterion 5 states (navigation to Case Detail).'
---

## What it is
Sixteen tests in one spec file (plus its own test-support module) over CaseVersionEditorScreen, proving the Discard control's visibility gate, its slug-typed confirmation Dialog, the DELETE it issues, both terminal outcomes, and the Keep draft control.

## Notes
Ships its own test-support module (case-version-editor-screen-discard.test-support.ts) rather than reusing the sibling release proof's render helper, since this task's own tests need a second registered route ("/cases/$slug", Case Detail) for criterion 5's navigation assertion to resolve against -- a router concern the release proof's own helper had no reason to carry.
