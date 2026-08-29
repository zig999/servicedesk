---
title: Concept literal fixture maintenance
summary: Pre-existing fixture and test-double literals across the backend tree are
  brought into compliance with the now-required Concept.description field, with no
  change to any existing assertion or behavior beyond that field.
rationale: This scope is fixture maintenance against a domain fact the specification
  already decided, not new implementation, so a new epic is cut rather than folding
  these tasks into the concept-description epic. All three impact-set nodes are placed
  in uncovered because no task here implements registration, persistence or refusal
  behavior — that already shipped elsewhere in this plan.
sources:
- intake/pre-existing-concept-literals-scope.md
covers:
- domain/glossary/concept
- rules/glossary/a-concept-declares-its-description
- scenarios/glossary/a-concept-with-no-description-is-refused
uncovered:
- node: domain/glossary/concept
  why: The required description attribute was already added to the Concept type by
    task/concept-description/concept-registration-requires-a-description in this plan;
    this epic's tasks only adapt pre-existing literals and assertions to that already-decided
    shape, never the domain model itself.
- node: rules/glossary/a-concept-declares-its-description
  why: The refusal behavior this rule states was already implemented by the concept-description
    epic's tasks; nothing in this epic registers, updates or refuses a concept.
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  why: The scenario's refusal path was already delivered by the concept-description
    epic; this epic's tasks touch unrelated fixtures and test doubles that happen
    to construct Concept-shaped literals, never that path.
---

## What it is
The complete backend-tree cleanup needed after Concept.description became required, restricted to literals and assertions outside the three tasks that already own the widening.
It covers both failure modes the inventory found: compile-time typecheck breaks and runtime .toEqual mismatches.

## Notes
concept.json and its consumers are not touched — the inventory found every consumer reads the seed fixture through its own local interface, never the glossary's Concept type.
The heldConcept(overrides: Partial<Concept> = {}): Concept fixture-builder pattern already established per spec file is reused — a placeholder description is added inside each existing builder, never a new shared helper.
