---
title: Direct release control on the hypothesis-revisions listing
summary: Exercises the per-row release control, its request shape, cache update on success, and the not-draft-at-release refusal, all through the rendered HypothesisRevisionHistory screen with a stubbed fetch.
implementation: sha256:8363fd3ebcd0d33d226e1ca8a559446af15948848aa260b845437ac9440f9e04
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-own-state-ui-release-a-revision-from-the-listing-suite-2
tests:
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 1) > offers a release control on the row of a revision whose own state is draft
  proves: A row whose revision's own state is draft offers a release control.
  fails_when: the draft revision's row stops rendering a "Release..." button (control gated on something other than, or in addition to, revision.state === "draft").
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 2) > offers no release control on the row of a revision whose own state is released
  proves: A row whose revision's own state is released offers no release control.
  fails_when: a "Release..." button appears (enabled, disabled, or otherwise) on a released revision's row.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 3) > issues exactly one POST to the release endpoint for the row's own revision number when the control is confirmed
  proves: Confirming the control issues one POST to /v1/cases/:slug/hypotheses/:name/revisions/:revision/release for the row's own revision number.
  fails_when: confirming issues zero, two, or more requests to that URL, or targets a different revision number than the row's own.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 4) > sends the release request with no body, no headers and no other case version or manifest data
  proves: That request names no case version, carries no manifest entry and sends no credential.
  fails_when: the recorded request's init carries a body, a headers object (e.g. an Authorization header), or the URL used is not the exact revision-scoped path already asserted in criterion 3.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 5) > shows the released revision's row as released, without re-reading the listing, after the release succeeds
  proves: After the request succeeds, the released revision's row states released without the screen being reloaded.
  fails_when: the row fails to read "Released" after success, or the listing endpoint is fetched again (a reload/refetch) to reach that state.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 6) > offers the release control to an unmanifested draft revision on the same terms as one the manifest pins
  proves: A revision no case version's manifest holds an entry for is offered the release control on the same terms as a manifested one.
  fails_when: the control's visibility starts depending on manifest-pin data, so a manifested draft and an unmanifested draft are no longer offered it equally.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 7) > leaves every case version's own state unread and unrefetched after a release succeeds
  proves: After a release succeeds, every case version's own state reads exactly what it read before the release.
  fails_when: a successful release triggers any additional GET to the case-versions listing or the pinned version's manifest endpoint beyond the screen's initial load.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 8) > re-reads the listing from the server, rather than leaving the pre-attempt row, when the release is refused because the revision is no longer draft
  proves: A release refused with HypothesisRevisionNotDraftAtReleaseError leaves the listing re-read from the server rather than showing the row as it stood before the attempt.
  fails_when: the listing endpoint is not fetched again after this refusal, or the row keeps showing the pre-attempt "Draft" state instead of what the re-read server response reports.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing a revision directly (criterion 9) > tells the curator exactly the refusal's own condition and message, and nothing else, after that refusal
  proves: What the curator is told after that refusal reports the refusal's own condition and message and no further value about the revision.
  fails_when: the toast shown is not exactly the ApiError's own message, or more than one toast is raised for this refusal.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- release confirmation copy > names the row's own revision number and warns that the content can never change again
  proves: the implementation's inference that the release dialog's copy (title naming the row's own revision, the never-changes-again description, Cancel/Release labels) is what actually renders
  fails_when: the dialog's title stops naming the confirmed row's own revision number, the description text changes, or the Cancel/Release buttons are renamed or removed.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- release control composition > composes the release control beside the existing Revise link in the same actions cell, adding no new column
  proves: the implementation's inference that the release control composes into the existing actions cell beside the Revise link rather than occupying a new column
  fails_when: a new column is added to the table, or the release control stops rendering alongside the Revise link within the same row's actions cell.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- a release refused by any other error > leaves the dialog open and shows only a generic failure message, without disturbing the listing
  proves: the implementation's inference that any mutation error other than the named not-draft-at-release refusal leaves the dialog open and shows only a generic toast
  fails_when: the dialog closes on an unrelated/unmapped error, the toast shown is not the generic release-failure message, or the listing is refetched for this error.
- file: src/routes/hypothesis-revision-history-release-action.spec.ts
  name: HypothesisRevisionHistory -- releasing one revision leaves a sibling revision alone > updates only the released revision's own row, leaving a sibling draft revision's row and control unaffected
  proves: the cache write on success (criterion 5 / the setQueryData inference) updates only the matching revision, never a sibling row's state or control
  fails_when: releasing one revision changes another draft revision's row to "Released" or removes its own release control.
untested:
- 'The onError branch''s `error instanceof ApiError ? error.message : GENERIC_RELEASE_FAILURE_MESSAGE` fallback for a non-ApiError thrown from the mutation is not exercised: every refusal reachable through the stubbed fetch already arrives as an ApiError via apiFetch''s own toApiError, so the non-ApiError half of that ternary has no path exercising it here.'
- Whether the confirm button disables while the release request is still pending, and thereby blocks a second rapid confirm from issuing a second POST, is not asserted -- only that one click yields exactly one request is proven.
- Whether closing the dialog (on cancel, on success, or on the named refusal) returns focus to the row's own trigger button is not asserted.
not_applicable:
- edge_case: Absent or empty user-entered input
  why: The release control takes no typed input; confirming issues a fixed request with no user-supplied value to validate.
- edge_case: A boundary at each end of a numeric range
  why: No numeric range is entered by the curator here -- revision numbers are server-supplied and merely echoed into the URL.
- edge_case: An empty collection where one comes back
  why: The zero-revisions and zero-versions load-failure behavior is this listing's own pre-existing behavior, already covered by hypothesis-revision-history.spec.ts, which this task neither changes nor is asked to re-prove.
- edge_case: A duplicate where uniqueness is claimed
  why: No criterion of this task claims uniqueness over any collection this control touches.
---
## What it is

Thirteen tests, all exercising the release control through the rendered HypothesisRevisionHistory screen with a stubbed fetch, prove the nine criteria plus three of the implementation's own recorded inferences.
The first suite attempt failed the project's own typecheck step on two issues local to the new spec file (a tuple-type mismatch on a fetch-mock helper's return type, and an unused binding); both were fixed and the suite reran clean.

## Notes

The suite's first run (run/hypothesis-revision-own-state-ui-release-a-revision-from-the-listing-suite) failed at typecheck on this proof's own new test file; the errors were local to the test file (a tuple-return-type mismatch on a fetch-mock helper and an unused variable), not the source under test, so they were sent back to the test-author rather than diagnosed, and the suite reran under -suite-2, which passed clean.
