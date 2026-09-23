---
title: Aggregate structural and manifest-own-state violations into one release refusal
summary: release.operation.ts's releaseViolations names a structural failure and a manifest-own-state
  failure together, in the one refusal, rather than reporting only the structural one and requiring a
  second release attempt to meet the other.
rationale: 'Corrective: releaseViolations currently returns early on a structural failure without ever
  computing the manifest-own-state violations, which the task''s own criterion below closes.'
sources:
- intake/corrective-release-violation-aggregation-gap.md
objective: A release attempt whose case version fails both a structural rule and the manifest-own-state
  rule is refused once, with both kinds of violation named together in CaseVersionNotReleasableError.
criteria:
- Where structuralOutcome(assembled) reports kind === 'invalid', releaseViolations also computes manifestOwnStateViolations(assembled,
  sources.hypothesisRevisions) and returns the structural problems merged with those violations, in place
  of returning the structural problems alone.
- A release attempt against a draft that fails a structural rule and separately manifests an entry referencing
  a still-draft hypothesis-revision is refused once, through one CaseVersionNotReleasableError naming
  both the structural violation and the manifest-own-state violation together.
- 'Where structuralOutcome(assembled) reports kind === ''valid'', release behaves exactly as before this
  task: coherence violations and manifest-own-state violations are computed and merged as they already
  were.'
- No other behavior of release() or releaseViolations() changes.
- The suite under src/src/__tests__ passes, with a new test proving the merged-violations behavior added,
  and — since one pre-existing integration test's fixture incidentally used still-draft hypothesis-revisions
  while asserting only structural violations, and this fix now correctly also names the manifest-own-state
  violation those draft revisions trigger — that fixture updated to use already-released hypothesis-revisions
  instead, isolating the test to its original structural-only intent, and no other change to any test file.
implements:
- contracts/knowledge/case-lifecycle
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
---

## What it is

See intake.

## Notes

REMAINDER, from the execution-contract-binder — the message-content clauses of
rules/knowledge/a-release-refusal-with-no-named-violation-says-so (naming the case slug and version
number, and the explicit empty-violation statement) reach no criterion of this task, which touches only
aggregation; the place-hypothesis clause of
rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions reaches no criterion
either, since this task's criteria concern only the release path.
