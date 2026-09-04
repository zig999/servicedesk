Expose the hypothesis-revision's own release lifecycle (delivered backend-only by the just-closed
hipotese-release-proprio initiative) in the frontend UI.

The backend now delivers:
- Every hypothesis-revision carries its own state (draft/released), moved by a curator's own
  release action, independent of any case version or manifest.
- POST /v1/cases/:slug/hypotheses/:name/revisions/:revision/release — releases a
  hypothesis-revision directly. Refuses with HTTP 409 (HypothesisRevisionNotDraftAtReleaseError)
  if the named revision is already released. Requires no case version, no manifest entry, and no
  credential.
- GET .../revisions (list-hypothesis-revisions) now discloses each listed revision's own state
  (draft/released) alongside its existing fields (revision, criterion, collects, resolution).
- A case version's own release is now refused (HTTP 422, CaseVersionNotReleasableError, no new
  error code) whenever any manifest entry still references a hypothesis-revision in draft state —
  naming every such hypothesis among the refusal's violations. Placing a manifest entry itself
  stays unrestricted regardless of the referenced revision's state.

What the frontend does not yet do, and needs to:
- The hypothesis-revisions listing screen (wherever list-hypothesis-revisions is currently
  rendered) does not show each revision's own state.
- There is no UI action to release a hypothesis-revision directly (independent of releasing a
  case version).
- The case-version release flow does not yet surface the new refusal's named violations (which
  hypotheses are still draft) to the curator attempting the release.

Out of scope: any backend change (already delivered and closed); data migration (none needed, per
the original scope's own confirmation that existing data may be discarded/recreated).

Source: the closed hipotese-release-proprio initiative's own specification nodes —
domain/knowledge/hypothesis-revision, domain/knowledge/hypothesis-revision-state,
rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle,
rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state,
rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions,
contracts/knowledge/case-lifecycle.
