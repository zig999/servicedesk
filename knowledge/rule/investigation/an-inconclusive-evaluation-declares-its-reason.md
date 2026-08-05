---
title: An inconclusive evaluation declares its reason
summary: An absent fact, a failed judgement and an exhausted deadline are three different things and never one.
ddd: invariant
statement: An evaluation whose verdict is inconclusive MUST declare whether its reason is no data, a judgment failure, or an exhausted deadline.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/evaluation
examples:
  - Given a hypothesis whose evidence timed out, when it is judged, then the reason is no data and it cites the evidence whose result was not ok.
  - Given a hypothesis that never got a slot before the deadline, when the investigation is built, then the reason is an exhausted deadline rather than a judgment failure.
---

## What it is

Without this distinction an infrastructure failure reads as a fact about the world, which is the pathology the rest of the system exists to avoid.
It also decides what the learning loop can see — reading a queue as a judgment failure points curation at the prompt when the answer is that the case has too many hypotheses.

## Rules

None.
