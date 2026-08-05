---
title: A hypothesis name is unique in its case
summary: Two hypotheses of the same case never share a name, because evaluations are indexed by it.
ddd: invariant
aggregate: cases
statement: Two hypotheses of the same case MUST NOT share a name.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/knowledge/hypothesis
examples:
  - Given two hypotheses both named onu-offline in one case, when it is published, then publication is refused.
---

## What it is

An evaluation is identified by the name of the hypothesis it judges, so two hypotheses sharing a name would collide in silence rather than fail.

## Rules

None.
