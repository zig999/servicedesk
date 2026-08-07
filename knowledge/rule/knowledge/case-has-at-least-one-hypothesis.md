---
title: A case has at least one hypothesis
summary: A case with no hypothesis investigates nothing.
ddd: invariant
aggregate: cases
statement: A case MUST declare at least one hypothesis.
expression: count(case.hypotheses) >= 1
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/case
consistency: immediate
examples:
  - Given a case whose hypothesis list is empty, when it is published, then publication is refused.
  - Given a case whose hypothesis list is empty, when it is validated, then the refusal sits at the hypothesis list and carries the text «Este caso não declara nenhuma hipótese. Um caso investiga por hipóteses — acrescente ao menos uma antes de publicar.»
---

## What it is

A case exists to name what might be wrong, and one that names nothing cannot be run.
The position of its refusal is the hypothesis list itself, which is nameable while it is empty.

## Rules

The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.
