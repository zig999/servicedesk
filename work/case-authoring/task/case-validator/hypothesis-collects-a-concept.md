---
title: "A hypothesis collects at least one concept"
summary: "The check that refuses a case holding a hypothesis that collects nothing."
rationale: "The scope named the validating rules as a set and left the cut inside them open, and this rule refuses a different case for a different reason than its neighbours, so it is its own task."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A case holding a hypothesis that collects no concept is refused by this check, and a case whose every hypothesis collects at least one concept is not refused by it."
criteria:
  - "A case holding one hypothesis that collects no concept is refused by this check."
  - "A case whose every hypothesis collects at least one concept is not refused by this check."
  - "A case whose only failing hypothesis is not the one it lists earliest is still refused by this check."
depends_on:
  - task/case-validator/validation-run
  - task/published-case/case-structure
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/glossary/concept
  - rule/knowledge/hypothesis-collects-at-least-one-concept
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - question: "The base does not state whether a case under edit carries its hypotheses, and their collects lists, in the same shape as a published case, yet this check decides a case before it is published, so what the check walks is described nowhere."
waived:
  - gap: definition/glossary/concept#attributes.ttl.unit
    why: "This check counts the entries of a hypothesis's collects list and never reads a concept's staleness tolerance; the unit bears on the separate ttl check with its own task."
---

## What it is

The structural check standing behind the base's statement that a hypothesis collecting nothing could never cite anything.
A refusal decided per hypothesis, over every hypothesis of the case.

## Notes

The third criterion fixes that the check reads every hypothesis rather than the one it reaches soonest.
BLOCKING, from the binding — the construct a pre-publication check reads is the case under edit, which this epic does not claim and whose shape beyond its slug the base declares absent, so the thing this check refuses is described by no node the task may bind.
From the binding — the order in which a case lists its hypotheses is enough to walk every element, but what that order means is stated by a rule outside this claim, so no criterion should be read as asserting the earliest-listed hypothesis is the dominant cause.
