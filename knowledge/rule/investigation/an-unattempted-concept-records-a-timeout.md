---
title: An unattempted concept records a timeout
summary: A concept the collection never reached is an evidence carrying the timeout result, never an absent evidence.
ddd: invariant
statement: A concept the collection never attempted — its deadline exhausted before any attempt — MUST be recorded as an evidence carrying the timeout result, never as an absent evidence.
sources:
  - intake/decisoes-cinco-perguntas-2026-08-06.md
constrains:
  - definition/investigation/evidence
consistency: immediate
examples:
  - Given a collection whose deadline is exhausted before one concept gets any attempt, when the investigation is written, then that concept's evidence carries the timeout result.
  - Given no hypothesis confirmed and one concept never attempted, when the case resolves, then the recorded timeout makes it answer with its no-data fallback rather than the hypotheses-exhausted one.
---

## What it is

What was exhausted is the deadline, so the never-attempted concept records the same result family as the attempt that ran out of time.
This is what keeps the two kinds of nothing apart — a case that reached no data never reads as a case whose hypotheses were all judged and exhausted.

## Rules

None.
