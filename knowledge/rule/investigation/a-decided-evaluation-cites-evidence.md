---
title: A decided evaluation cites evidence
summary: A verdict that confirms or refutes points at the concept and field it rested on, and the field must be one that concept declares.
ddd: invariant
statement: An evaluation whose verdict is confirmed or refuted MUST cite at least one concept and field, and every field it cites MUST be one the cited concept declares.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-seis-perguntas-2026-08-05.md
constrains:
  - definition/investigation/evaluation
  - definition/glossary/concept
consistency: immediate
examples:
  - Given an evaluation confirming a hypothesis and citing a field the cited concept does not declare, when it is validated, then it is refused.
  - Given an evaluation citing a concept the hypothesis does not collect, when it is validated, then it is refused.
---

## What it is

The criterion is prose and cannot be checked, so what replaces determinism is a citation a machine can check.
Without this, traceability is a promise that does not survive six months.
The field is checked against what the concept declares rather than against a capability's schema, so the authority stays in the glossary and a reader looking for it finds it there.

## Rules

None.
