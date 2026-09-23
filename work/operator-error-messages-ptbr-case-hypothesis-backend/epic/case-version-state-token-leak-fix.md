---
title: Case-version-state refusals stop leaking the raw lifecycle token
summary: Corrects three delivered refusal classes that interpolate the internal lifecycle-state token
  instead of the fixed Portuguese word this initiative's own task required.
rationale: Surfaced by this initiative's own /review-change conformance pass as a contradiction of the
  task's own delivered criteria, not a new fact.
sources:
- intake/corrective-case-version-state-token-leak.md
covers:
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- domain/knowledge/case
- domain/knowledge/case-version
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/investigation/only-a-released-case-version-is-diagnosed
- scenarios/investigation/a-draft-case-version-refuses-diagnosis
uncovered:
- node: domain/knowledge/case
  why: The task's binder found no criterion of this task reaching the case aggregate's own attributes
    or operations; only the case-version state carried in the refusal messages is touched.
- node: domain/knowledge/case-version
  why: The task's binder found no criterion reaching the case-version aggregate's own attributes or
    operations beyond the state word already covered by the vocabulary constraint.
- node: rules/knowledge/a-case-version-is-written-once
  why: This task changes only refusal-message text; it does not touch write-once enforcement.
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  why: This task changes only refusal-message text; it does not touch discard enforcement.
- node: scenarios/investigation/a-draft-case-version-refuses-diagnosis
  why: The task's binder attributed this scenario's remaining clauses to already-delivered
    investigation-pinning behavior outside this task's message-text criteria.
---

## What it is

See intake for the observed behavior.

## Notes

