---
title: A hypothesis collects at least one concept
summary: A hypothesis that collects nothing could never cite anything.
ddd: invariant
aggregate: cases
statement: A hypothesis MUST collect at least one concept.
expression: count(hypothesis.collects) >= 1
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/knowledge/hypothesis
examples:
  - Given a hypothesis with an empty collects list, when its case is published, then publication is refused.
---

## What it is

An evaluation that confirms or refutes must cite a concept and a field, so a hypothesis with nothing to collect could never satisfy that requirement.

## Rules

None.
