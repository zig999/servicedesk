---
title: The six published case-lifecycle operations
summary: create-draft, revise-hypothesis, place-hypothesis, remove-hypothesis, release and discard, each granular enough to apply its own cardinality rule at its own moment, replacing the one retired author-case-version command.
rationale: The scope's §3.3 table already lists these six operations as the surface to build; I split them into five operation tasks (grouping the two create-draft call shapes together and place/remove-hypothesis together as mirror manifest mutations) plus one wiring task the scope does not itself name, since retiring the old command and composing the new ones is a distinct concern from any single operation's own business rule.
sources:
- work/case-lifecycle/intake/scope.md
covers:
- contracts/knowledge/case-lifecycle
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- domain/knowledge/manifest-entry
- rules/knowledge/a-case-has-at-most-one-draft
- rules/knowledge/a-case-version-number-is-never-reused
- rules/knowledge/a-hypothesis-revision-number-is-never-reused
- rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-position-is-unique-within-its-case
- rules/knowledge/a-case-has-at-least-one-hypothesis
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- rules/knowledge/a-hypothesis-name-is-unique-within-its-case
- rules/knowledge/case-terms-exist-in-the-glossary
- rules/knowledge/a-concept-accepts-the-declared-subject-type
- rules/knowledge/every-collected-concept-has-a-read-only-capability
- rules/knowledge/the-contract-check-reads-the-current-registration
- rules/knowledge/validation-runs-at-every-read
- scenarios/knowledge/a-released-version-keeps-its-original-revision
---

## What it is

The business logic layer that decides whether a curator's request is allowed, sitting on top of the store built one epic over.
It is what makes contracts/knowledge/case-lifecycle a reachable, published surface rather than five unconnected functions.

## Notes

None.
