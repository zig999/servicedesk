---
title: "A case declares at least one hypothesis"
summary: "The check that refuses a case declaring no hypothesis at all."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case that declares no hypothesis is refused by this check, and a case that declares at least one is not refused by it."
criteria:
  - "A case declaring no hypothesis is refused by this check."
  - "A case declaring exactly one hypothesis is not refused by this check."
  - "A case declaring several hypotheses is not refused by this check."
depends_on:
  - task/case-validator/validation-run
  - task/published-case/case-structure
nodes:
  - rule/knowledge/case-has-at-least-one-hypothesis
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - aggregate/knowledge/cases
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - question: "No node states what a case declaring no hypothesis looks like as the input this check reads: the base distinguishes the case under edit from the published case, and the shape of the one under edit is itself declared absent."
---

## What it is

The structural check standing behind the base's statement that a case with no hypothesis investigates nothing.
A refusal decided from the case's own declarations, reading nothing outside the case.

## Notes

The two passing criteria assert only that this check does not refuse, since another check may still refuse the same case for its own reason.
BLOCKING, from the binding — the published case declares a minimum of one hypothesis, so no value of it can hold none; the construct that can is the case under edit, which this epic does not claim.
BLOCKING, from the binding — both bound nodes decide when and over what this check fires, and the criteria speak only of this check, so a check that never runs at publication or runs over something narrower than the whole case would satisfy all three.
