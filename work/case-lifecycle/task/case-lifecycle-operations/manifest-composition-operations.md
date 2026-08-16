---
title: place-hypothesis and remove-hypothesis operations
summary: Composes a draft version's own manifest — placing a hypothesis-revision at a position, or removing an entry — refusing outside draft state and refusing an emptied manifest.
rationale: I grouped place-hypothesis and remove-hypothesis into one task since they are the two mirror-image mutations of the same manifest, sharing the same draft-only guard and the same at-least-one-entry guard; the scope does not itself state whether these are one task or two.
sources:
- work/case-lifecycle/intake/scope.md
objective: A curator may freely compose a draft version's own manifest — placing a hypothesis-revision at a position, or removing an entry — while the version remains open, never emptying it and never touching a released version.
criteria:
- Placing a hypothesis-revision at a position not yet occupied in a draft's manifest succeeds.
- Placing a hypothesis-revision at a position already occupied by a different hypothesis in the same manifest is refused.
- Placing or removing an entry against a version that is not in draft state is refused.
- Removing the last remaining entry of a draft's manifest is refused, naming that the manifest would hold no hypothesis.
- Removing a manifest entry never deletes the hypothesis-revision it referenced.
- Reordering two hypotheses already placed in a draft's manifest, by placing each at the other's own position, creates no new hypothesis-revision.
depends_on:
- task/case-lifecycle-persistence/relational-case-store-for-lifecycle
- task/case-lifecycle-domain-model/aggregate-types-and-structural-validation
implements:
- contracts/knowledge/case-lifecycle
- domain/knowledge/case-version
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-case-has-at-least-one-hypothesis
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-case-version-is-written-once
---

## What it is

The one place a draft's own precedence is composed, entry by entry.
It never creates or edits a hypothesis-revision's own content.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once states two clauses joined in one statement: a released version and its manifest entries are never altered again (answered here by this task's third criterion), and revising a case's content composes the next draft version instead. No criterion of this task addresses the second clause. Belongs to: task/case-lifecycle-operations/create-draft-operation and task/case-lifecycle-operations/revise-hypothesis-operation, the operations that originate a new draft in response to revision — a different task of this same epic.
