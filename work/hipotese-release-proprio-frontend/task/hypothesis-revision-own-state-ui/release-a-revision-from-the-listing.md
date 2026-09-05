---
title: Release a hypothesis-revision directly from the listing
summary: The per-revision release control, its request, and what the curator is left with on success and on refusal.
rationale: I placed the direct release control on the revisions listing screen because that is the one surface this plan gives the revision's own state to, and I made it depend on the state task and the error-mapping task because it consumes both — the state to decide which rows offer the control, the mapping to answer the refusal as anything but a generic failure.
sources:
  - intake/scope.md
objective: A curator releases a draft hypothesis-revision directly from the revisions listing, and that revision then reads released on the same screen.
criteria:
  - A row whose revision's own state is draft offers a release control.
  - A row whose revision's own state is released offers no release control.
  - Confirming the control issues one POST to /v1/cases/:slug/hypotheses/:name/revisions/:revision/release for the row's own revision number.
  - That request names no case version, carries no manifest entry and sends no credential.
  - After the request succeeds, the released revision's row states released without the screen being reloaded.
  - A revision no case version's manifest holds an entry for is offered the release control on the same terms as a manifested one.
  - After a release succeeds, every case version's own state reads exactly what it read before the release.
  - A release refused with HypothesisRevisionNotDraftAtReleaseError leaves the listing re-read from the server rather than showing the row as it stood before the attempt.
  - What the curator is told after that refusal reports the refusal's own condition and message and no further value about the revision.
depends_on:
  - task/hypothesis-revision-own-state-ui/show-each-revisions-own-state
  - task/hypothesis-revision-own-state-ui/name-the-not-draft-release-refusal
implements:
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/hypothesis-revision-state
  - rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  - rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  - scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  - contracts/knowledge/case-lifecycle
  - constraints/no-route-enforces-authentication
---
## What it is

A release mutation, a confirmation, and a per-row control offered only for a draft revision.
The refusal path answers the one refusal this operation has, and states nothing the refusal did not report.

## Notes

The inventory names the existing mutation-plus-dialog-state shape used by the case-version release control as reusable for a per-revision control; this task reuses that shape rather than cutting a second one.
