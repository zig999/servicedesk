---
type: domain-service
operations:
  - evaluate
---

## Description

The port through which one hypothesis is judged against its evidence.
The rule it applies is not in code but in the case's prose, so the tension between a prose criterion and a mechanical one resolves by adapter — an LLM in production, a fake in test, a rule evaluator as a future option — without a second criterion form in the schema.

## Responsibility

Given one hypothesis's criterion, its own evidence, and the pinned case's title and when_to_use, return an evaluation that is cited and complete, never inferred.
