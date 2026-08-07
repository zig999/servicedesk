---
title: A hypothesis collects at least one concept
summary: A hypothesis that collects nothing could never cite anything.
ddd: invariant
aggregate: cases
statement: A hypothesis MUST collect at least one concept.
expression: count(hypothesis.collects) >= 1
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/hypothesis
examples:
  - Given a hypothesis with an empty collects list, when its case is published, then publication is refused.
  - Given a hypothesis with an empty collects list, when its case is validated, then the refusal carries the text «A hipótese «{hipotese}» não coleta nenhum conceito. Sem coleta ela nunca poderá citar evidência — declare ao menos um conceito em coletas.», with the hypothesis named in place.
---

## What it is

An evaluation that confirms or refutes must cite a concept and a field, so a hypothesis with nothing to collect could never satisfy that requirement.

## Rules

The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.
