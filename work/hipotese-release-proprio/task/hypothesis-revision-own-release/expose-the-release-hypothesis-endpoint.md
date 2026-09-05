---
title: Publish release-hypothesis on the case-lifecycle surface
summary: The request surface through which a curator releases a hypothesis-revision, outside the context
  of any case version.
rationale: The planning cut the surface from the transition because the two cross one seam — the operation
  and its consumer — and because the surface's own conditions, the validation refusal and the credential-free
  route, are falsifiable without the transition being re-proved through them.
sources:
- work/hipotese-release-proprio/intake/scope.md
objective: release-hypothesis is reachable on the published case-lifecycle surface as an action against
  a hypothesis-revision alone.
criteria:
- The route is registered on the built application, so release-hypothesis is reachable with no further
  wiring.
- A well-formed release-hypothesis request naming a hypothesis-revision whose own state is draft is not
  refused, and that revision's own state is released afterward.
- A release-hypothesis request naming a hypothesis-revision whose own state is already released answers
  HTTP 409, with a body whose error identity is HypothesisRevisionNotDraftAtReleaseError and which carries
  no further value.
- A release-hypothesis request naming no case version and no manifest entry is not refused for their absence,
  and no case version's own state and no manifest entry changes as a result of the request.
- A release-hypothesis request whose path or body fails the route's own schema answers HTTP 400, reporting
  a VALIDATION_ERROR error code, a message naming whether path, query or body failed, and a non-empty
  details list of the issues found.
- The route refuses no request for want of a credential.
depends_on:
- task/hypothesis-revision-own-release/release-a-revision-directly
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

The eighth operation the published case-lifecycle contract now offers, beside create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, update-draft, release and discard.
It is dispatchable against a hypothesis-revision with no case version named and no manifest involved at all.

## Notes

REMAINDER, from the specification — `constraints/no-route-enforces-authentication`'s second clause ("the frontend discloses this posture to every user, on every screen") reaches no criterion of this task, a backend request surface; only the route-side clauses are answered here. Belongs to the frontend plan's own screen-shell disclosure work.
ADVISORY, from the specification — `contracts/knowledge/case-lifecycle` names `rules/knowledge/a-released-hypothesis-revision-is-never-altered` as the guarantee release-hypothesis establishes; that node sits outside this epic's covers, so no task of this epic demonstrates it here.
Decision, beyond the covers — stand: rules/knowledge/a-released-hypothesis-revision-is-never-altered's guarantee is proven by `task/hypothesis-revision-own-state/refuse-altering-a-released-revision`, already delivered by the sibling epic; this task exercises the transition, not the immutability it then protects.
