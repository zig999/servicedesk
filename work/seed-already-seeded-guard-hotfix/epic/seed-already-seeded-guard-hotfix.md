---
title: seed.ts's own reseeding survives the case it seeds becoming permanent
summary: The one corrective task that stops seed.ts's alreadySeeded() guard from permanently skipping concept/capability/vocabulary reseeding once the case it gates on can never be wiped again.
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container the validator still requires, holding exactly the one task's own claim.
covers:
  - domain/glossary/outcome
  - domain/glossary/concept
  - domain/integration/capability-registry
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - rules/knowledge/a-case-version-is-written-once
  - domain/knowledge/hypothesis-revision
uncovered:
  - node: domain/knowledge/hypothesis-revision
    why: Describes a hypothesis revision's own identity and immutability once a released case version manifests it. Nothing in this task's objective or its four criteria names a hypothesis, a revision, a manifest entry or a resolution — the fix is scoped to vocabulary/concept/capability additivity and to narrowing alreadySeeded()'s gate to seedCase as a whole, which stays fully gated and untouched. The node is exercised unchanged inside seedCase but governs none of this task's criteria.
sources:
  - intake/scope.md
---

## What it is

A single-task epic for the seed-already-seeded-guard-hotfix corrective increment.

## Notes

None.
