---
type: domain-service
operations:
  - consolidate
---

## Description

The port through which the assessment's text is produced once every required hypothesis's judgment is closed.
Outcome, referral and the determining hypothesis are never decided here — they come from the case's own resolve-outcome, already computed, unchanged by this call. The rule this port applies is a house style, not a domain fact, so the tension between a curator's framing and a mechanical one resolves by adapter — an LLM in production, a fake in test — without a second criterion form in the schema, the same resolution `domain/investigation/hypothesis-evaluator` already gives its own tension.

## Responsibility

Given every required hypothesis's evaluation, the evidence any of their citations name, and the pinned case's own consolidation register, return the assessment's text together with the call's own usage, elapsed_ms and prompt.
