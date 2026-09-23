---
title: release.operation.ts's release refusal names every violation together
summary: Corrects release.operation.ts so a structural failure and a manifest-own-state failure are always
  named in the same refusal, never split across two release attempts.
rationale: Surfaced by this initiative's own /review-change conformance pass as a code defect in a file
  this initiative's tasks touched only for message translation.
sources:
- intake/corrective-release-violation-aggregation-gap.md
covers:
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/the-system-persists-to-one-relational-database
- contracts/knowledge/case-lifecycle
- contracts/system/case-authoring
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/a-slug-identifies-one-case
- rules/knowledge/the-contract-check-reads-the-current-registration
- rules/knowledge/validation-runs-at-every-read
- scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
uncovered:
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  why: This task changes only aggregation logic; it introduces no new message text.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  why: This task changes only aggregation logic; it introduces no new message text.
- node: constraints/the-system-persists-to-one-relational-database
  why: This task changes no persistence code; releaseViolations reads through the ports it was
    already handed.
- node: contracts/system/case-authoring
  why: This task's binder found no criterion reaching the case-authoring surface beyond the release
    path already covered by contracts/knowledge/case-lifecycle.
- node: domain/knowledge/case-version
  why: This task's binder found no criterion reaching the case-version aggregate's own attributes.
- node: domain/knowledge/manifest-entry
  why: This task's binder found no criterion reaching the manifest-entry aggregate's own attributes
    beyond what manifestOwnStateViolations already read before this task.
- node: rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
  why: This task does not touch refuseNonDraft or any lifecycle transition; it touches only
    violation aggregation after the transition check has already passed.
- node: rules/knowledge/a-slug-identifies-one-case
  why: This task does not touch slug identity or lookup.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  why: This task does not touch capability-registry reads; it only merges violation arrays already
    computed from them.
- node: rules/knowledge/validation-runs-at-every-read
  why: This task's binder found the read-side IncoherentCaseError/InvalidCaseDocumentError divergence
    this node also touches was already a decided exclusion from a sibling task in this initiative,
    and this task's criteria do not reach it.
- node: scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
  why: This scenario's own message-content clauses reach no criterion of this task, which touches
    only aggregation of an already-produced violation.
---

## What it is

See intake for the observed behavior.

## Notes

