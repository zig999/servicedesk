---
title: No stage aborts on its deadline
summary: Exhausting a deadline produces a recorded result and the investigation continues.
ddd: invariant
statement: A stage that exhausts its deadline MUST record the result and let the investigation continue, except the write, which the response rule does not allow to degrade.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/investigation/evidence
  - definition/investigation/evaluation
consistency: immediate
examples:
  - Given a capability that does not answer in time, when collection ends, then its evidence records a timeout and the remaining hypotheses are still judged.
  - Given a judgement that does not return in time, when the investigation is built, then its evaluation is inconclusive for an exhausted deadline.
---

## What it is

This is the rule that turns a stated deadline into a guarantee rather than an intention.
An inconclusive hypothesis inside the deadline is a result, and an assessment outside the deadline is not.

## Rules

None.
