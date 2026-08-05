---
title: A decided evaluation cites evidence
summary: A verdict that confirms or refutes points at the field it rested on, and the field must exist.
ddd: invariant
statement: An evaluation whose verdict is confirmed or refuted MUST cite at least one concept and field, and every field it cites MUST exist in the output schema of the capability that produced that evidence.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/evaluation
  - definition/integration/capability
consistency: immediate
examples:
  - Given an evaluation confirming a hypothesis and citing a field absent from the capability's output schema, when it is validated, then it is refused.
  - Given an evaluation citing a concept the hypothesis does not collect, when it is validated, then it is refused.
---

## What it is

The criterion is prose and cannot be checked, so what replaces determinism is a citation a machine can check.
Without this, traceability is a promise that does not survive six months.

## Rules

None.
