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
  - rule/knowledge/hypothesis-collects-at-least-one-concept
  - definition/knowledge/hypothesis
  - definition/knowledge/draft-case
  - aggregate/knowledge/cases
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
---

## What it is
The structural check standing behind the base's statement that a hypothesis collecting nothing could never cite anything.
A refusal decided per hypothesis, over every hypothesis of the case.

## Notes

The third criterion fixes that the check reads every hypothesis rather than the one it reaches soonest.
From the binding — the construct this check refuses is now described by a bound node, and the predecessor's blocking note does not stand against the base as it is.
From the binding — the published case is left unbound, because it is the value publication emits and never exists for a case this check refuses.
From the binding — the aggregate's clause that a case is published whole or not at all reaches no criterion; it belongs to the publication act rather than to this single check.
From the binding — criterion 3 needs only the list order the case under edit declares, not the rule about what that order means.
