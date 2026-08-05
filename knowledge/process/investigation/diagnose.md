---
title: Diagnose
summary: One case run against one subject, from the attendant's choice to the written record and the response.
ddd: use-case
rationale: The material states one flow crossing all three contexts and records no compensation for any step, and the analysis records its stations as the constructs each one produces.
sources:
  - intake/arquitetura-troubleshooting-v5.md
steps:
  - node: definition/knowledge/case
  - node: definition/investigation/evidence
  - node: definition/investigation/evaluation
  - node: definition/investigation/assessment
  - node: definition/investigation/investigation
  - node: interface/investigation/investigation-completed
---

## What it is

The attendant chooses the case and supplies the subject and the report, and an existing investigation inside the idempotency window is returned instead of a new one.
The case is pinned by content, its plan of collection is the union of what its hypotheses collect, and every concept is collected once.
Each hypothesis is then judged on its own criterion and its own evidence, the case resolves which outcome follows, the text is written from a narrowed input, and the investigation is written before anything is answered.
There are no compensations, because every step before the write only reads and the write is last.

## Rules

A stage that exhausts its deadline records the fact and the flow continues, except the write, which the response rule does not allow to degrade.
Nothing is answered to the requester before the write succeeds.
