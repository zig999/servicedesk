---
title: Anthropic adapters report the provider's own usage, timing and prompt
summary: anthropic-hypothesis-evaluator.adapter.ts and anthropic-assessment-consolidator.adapter.ts read message.usage, measure elapsed time and return the materialized prompt instead of discarding them.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: The Anthropic-backed hypothesis-evaluator and assessment-consolidator adapters return the provider's own token usage, the call's measured elapsed time, and the prompt as materialized, instead of discarding them.
criteria:
  - anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns input_tokens and output_tokens read from the provider response's own usage, for any call that happened.
  - anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns elapsed_ms measured around its own provider call.
  - anthropic-hypothesis-evaluator.adapter.ts's evaluate() returns the judgment prompt exactly as materialized for that call.
  - anthropic-assessment-consolidator.adapter.ts's consolidate() returns input_tokens, output_tokens and elapsed_ms from its own provider call, the same way.
  - anthropic-assessment-consolidator.adapter.ts's consolidate() returns the consolidation prompt exactly as materialized for that call.
depends_on:
  - task/investigation-telemetry/widen-judgment-and-consolidation-ports
implements:
  - domain/investigation/usage
  - domain/investigation/evaluation
  - domain/investigation/assessment
---

## What it is

Both Anthropic adapters stop discarding message.usage.
Both wrap their own provider call with elapsed-time measurement.
Both return the prompt they already assemble internally, now as part of the port's own answer.

## Notes

A port's evaluate()/consolidate() call never throws for a domain outcome; a provider failure still becomes a typed inconclusive/judgment-failure value, unchanged by this task.
Original sixth criterion ("a port call that ends without invoking the provider returns no usage/elapsed_ms/prompt") dropped for consolidate() on composition: `domain/investigation/assessment` states the consolidation call always happens, so that clause no longer applies to it; it still holds for evaluate(), covered implicitly by criteria 1–3 only firing "for any call that happened."
