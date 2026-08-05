---
title: A case has at least one hypothesis
summary: A case with no hypothesis investigates nothing.
ddd: invariant
aggregate: cases
statement: A case MUST declare at least one hypothesis.
expression: count(case.hypotheses) >= 1
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/knowledge/case
consistency: immediate
examples:
  - Given a case whose hypothesis list is empty, when it is published, then publication is refused.
---

## What it is

A case exists to name what might be wrong, and one that names nothing cannot be run.

## Rules

None.
