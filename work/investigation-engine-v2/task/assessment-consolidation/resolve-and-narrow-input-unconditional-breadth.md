---
title: resolve-and-narrow-input always produces the full breadth
summary: resolve-and-narrow-input drops its confirmed/fallback branching for the rule's current unconditional-breadth shape.
objective: resolve-and-narrow-input produces every required hypothesis's evaluation, plus the evidence its citations name, in every outcome, never only the confirming or fallback path.
criteria:
  - Given a confirmed outcome, the narrowed input still carries every required hypothesis's evaluation, not only the one that confirmed.
  - Given no confirmation, the narrowed input still carries every required hypothesis's evaluation.
  - The narrowed input never carries a hypothesis's criterion, the case's when_to_use, or a hypothesis outside those the case requires evaluation of.
  - The narrowed input carries exactly the evidence its included citations name, no more.
rationale: The rule's current text is unconditional breadth in every outcome; reworking the type shape without dropping the confirmed/fallback branching would leave the module compiling against a rule it no longer matches, so the branching removal is this task's one objective, independent of the consolidator it later feeds.
implements:
  - domain/investigation/assessment-consolidator
  - domain/investigation/evaluation
  - domain/investigation/citation
  - domain/investigation/evidence
  - domain/knowledge/case
  - rules/investigation/the-writing-input-is-narrowed
sources:
  - intake/scope.md
---

## What it is

resolve-and-narrow-input.ts's confirmed/fallback branch removed in favor of always narrowing every required hypothesis's evaluation and its cited evidence.

## Notes

None.
