---
title: Investigation completed
summary: The fact that one investigation finished, carrying what it concluded and what it saw.
ddd: domain-event
ownership: published
payload: definition/investigation/investigation
rationale: The material lists the fields the event carries as a subset of the investigation, and the analysis records the investigation as the payload rather than naming a second shape the material does not name.
sources:
  - intake/arquitetura-troubleshooting-v5.md
---

## What it is

There is one event, and the whole learning loop is a projection over it — which hypotheses never confirm, which cases are always inconclusive, which concepts keep failing to answer, and which two hypotheses keep confirming together.
That last one is what says a case's precedence is wrong, and it exists only because every hypothesis is judged even after one has confirmed.
No further event and no feedback context are needed for any of it.

## Rules

The event is published after the investigation is written.
