---
title: Guard hypothesis-revision release on its current state
summary: releaseHypothesisRevisionRow refuses to release a hypothesis-revision that
  is not currently draft, instead of updating it unconditionally.
objective: Releasing a hypothesis-revision through RelationalCaseStore is refused
  unless that revision currently stands in draft state.
criteria:
- Releasing a hypothesis-revision whose currently stored state is not draft is refused
  with HypothesisRevisionNotDraftAtReleaseError, and the row is left exactly as it
  stood.
- Releasing a hypothesis-revision identity that has never been stored at all is refused
  with HypothesisRevisionNotDraftAtReleaseError.
- Releasing a hypothesis-revision whose currently stored state is draft succeeds,
  and the row reads released afterward.
sources:
- intake/scope.md
implements:
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
---

## What it is
None.

## Notes
REMAINDER, from the specification — rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle also requires the refusal to be an HTTP 409 response reporting a HypothesisRevisionNotDraftAtReleaseError; no criterion of this task reaches that clause, since every criterion is scoped to releaseHypothesisRevisionRow inside RelationalCaseStore, which raises a domain error and maps no status. It belongs to the task delivering the release-hypothesis surface of contracts/knowledge/case-lifecycle — the layer that maps this error to its HTTP 409 response.
UNDERDETERMINED, from the specification — the same statement also requires HypothesisRevisionNotDraftAtReleaseError to carry no further value beyond its own condition and message, and in particular never which of the two triggers (already-released vs never-stored) raised it. Criteria 1 and 2 name the error but say nothing about its payload, so an implementation raising the error with the state it read attached (for example a state field, or a message distinguishing the two branches) passes every criterion here while violating that clause. Passes: releaseHypothesisRevisionRow raising HypothesisRevisionNotDraftAtReleaseError with the offending state attached, or a message reading differently across the stored-but-released branch and the never-stored branch.
ADVISORY, from the specification — rules/knowledge/a-released-hypothesis-revision-is-never-altered states that altering a released hypothesis-revision's criterion, resolution or state is refused with ReleasedHypothesisRevisionNotAlterableError, and a release asked of an already-released revision reads as an attempt to alter its state; that node sits outside this epic's covers, and the specification's own disclosed record of past analysis already settles that the release refusal named here (including the never-stored branch) belongs to rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle, so this task's criteria name the right error. The guard must raise HypothesisRevisionNotDraftAtReleaseError and never ReleasedHypothesisRevisionNotAlterableError on the release path.
Decision, beyond the covers — stand: rules/knowledge/a-released-hypothesis-revision-is-never-altered is named only to distinguish it from the error this task's criteria require; this task implements no fact of that node and declares nothing about it, so it is not added to the epic's covers.
