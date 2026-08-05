---
title: One evaluation per hypothesis
summary: Every hypothesis the case declares gets a verdict, and silence is not one.
ddd: invariant
statement: An investigation MUST carry exactly one evaluation for every hypothesis its case declares.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/investigation
  - definition/knowledge/case
consistency: immediate
examples:
  - Given a case with four hypotheses and an investigation carrying three evaluations, when the investigation is built, then it is refused.
---

## What it is

An inconclusive verdict counts, so a hypothesis nobody could decide is still answered.
This is what the whole thing offers instead of correctness — not that a judgement is right, but that it is cited and complete.

## Rules

None.
