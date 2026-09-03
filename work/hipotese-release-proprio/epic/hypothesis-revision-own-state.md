---
title: A hypothesis-revision's own state
summary: The stored state a hypothesis-revision carries for itself, and the two write paths that now read
  it instead of reading a case version.
rationale: 'The planning cut the scope''s single increment into this epic because making the revision''s
  own state a stored and enforced fact is separable from the action that moves it: the schema, the immutability
  condition and the revise branch can each be shown met with no endpoint in existence, and each answers
  to a different specification node.'
sources:
- work/hipotese-release-proprio/intake/scope.md
covers:
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-revise-answers-the-revision-number-it-saved
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- scenarios/knowledge/a-draft-revision-is-overwritten-by-repeated-saves
- scenarios/knowledge/revising-a-released-revision-creates-the-next
- scenarios/knowledge/a-released-version-keeps-its-original-revision
- constraints/the-stored-schema-mirrors-the-declared-model
- constraints/the-schema-replays-from-its-scripts
- constraints/the-domain-depends-on-no-infrastructure
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
uncovered:
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  why: The scope confirms this requirement is unchanged by the increment — revising still demands the
    hypothesis's case hold a draft version, and no task here alters what the rule decides or what it refuses
    with.
- node: rules/knowledge/a-revise-offers-the-draft-manifest-only-when-the-pin-must-move
  why: It decides what a surface offers a curator once a revise completes, and the scope places everything
    under frontend/app/ in a separate plan.
---

## What it is

The part of the increment that turns a hypothesis-revision's release from a fact derived by joining to case versions into a fact the revision's own row holds.
It holds the schema that records the state, the schema condition that enforces immutability from it, and the revise branch that reads it to choose between replacing content in place and creating the next revision.
It stops at the state itself: the action that moves a revision from draft to released is another epic's.

## Notes

None.
