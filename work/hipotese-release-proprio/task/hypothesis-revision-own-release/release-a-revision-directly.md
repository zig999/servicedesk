---
title: Release a hypothesis-revision on its own terms
summary: The operation that moves a hypothesis-revision from draft to released and the refusal a further
  release attempt meets.
rationale: The planning cut the transition apart from the surface that exposes it, so the state machine
  is demonstrable against the operation alone and the surface's own conditions answer separately. The
  criterion over what the refusal reports is written from the governing rule's own statement rather than
  from a payload shape this cut decided, and the criteria name only values the hypothesis-revision aggregate
  itself stands over.
sources:
- work/hipotese-release-proprio/intake/scope.md
objective: A release taken directly against a hypothesis-revision moves it from draft to released, and
  a release asked of a revision not in draft is refused with a HypothesisRevisionNotDraftAtReleaseError.
criteria:
- Releasing a hypothesis-revision whose own state is draft leaves that revision's own state released.
- Releasing a hypothesis-revision whose own state is already released is refused with a HypothesisRevisionNotDraftAtReleaseError.
- The refusal reports its own condition and its own message as the whole of what it reports, carrying
  no further value.
- Releasing a hypothesis-revision that no case version's manifest holds an entry for is not refused for
  that absence.
- No case version's own state and no manifest entry changes when a hypothesis-revision is released.
- The operation reads no case version relation and no manifest relation to decide whether the release
  may proceed.
- No operation the system offers moves a hypothesis-revision's own state out of released.
depends_on:
- task/hypothesis-revision-own-state/store-the-revisions-own-state
- task/hypothesis-revision-own-state/refuse-altering-a-released-revision
implements:
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
- domain/knowledge/hypothesis-revision
- contracts/knowledge/case-lifecycle
- contracts/system/case-authoring
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/no-route-enforces-authentication
---

## What it is

The revision's own release: one forward transition, taken by a curator against the revision itself, with
released as its terminal state.
It is the same single-transition shape a case version's own lifecycle already holds, read over the hypothesis-revision
aggregate.

## Notes

The task builds on the schema condition as well as the column: the transition writes to a hypothesis-revision row, which the current condition refuses once any released case version references it.
UNDERDETERMINED, from the specification — the HTTP-status clause of `rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle`'s statement ("an HTTP 409 response") reaches no criterion here; criteria 2 and 3 name only the error identity and that it carries nothing further. A refusal answered at any status other than 409 satisfies every criterion as written.
UNDERDETERMINED, from the specification — `constraints/no-route-enforces-authentication`'s backend clause ("no route ... is guarded by an authentication mechanism") governs the route this operation is reached through, but no criterion here addresses authentication.
UNDERDETERMINED, from the specification — `constraints/a-malformed-request-is-refused-with-a-validation-error` governs the release-hypothesis route's shape refusal, but no criterion here addresses a malformed request.
REMAINDER, from the specification — `constraints/no-route-enforces-authentication`'s final clause ("the frontend discloses this posture to every user, on every screen") reaches no criterion of this task, which delivers the backend operation and its refusal only. Belongs to the frontend plan's own screen-shell disclosure work.
