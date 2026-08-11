---
title: The diagnose operation answers over HTTP, synchronously
summary: A Fastify endpoint exposes diagnose end to end, and an automated test proves the whole flow without a live provider credential.
rationale: >-
  The scope's front 6 states the endpoint's payload and response shape but not its file layout or
  which observation source backs a running server, and front 7 asks for one end-to-end test
  without naming where it sits. I placed both under one epic since the test verifies the
  endpoint's own integration with the rest of this plan rather than building a seam of its own;
  the endpoint's own bootstrap uses the fixture task's canned observations to seed a stand-in
  observation source, the same absence of a real corporate-records connector the
  composition-root epic already decided on. The execution-contract-binder's own implements pass
  over the end-to-end proof task returned a BLOCKING note — the test's own claim that no live
  LLM call happens rests on the hypothesis-evaluator and assessment-consolidator ports admitting
  a fake adapter, which this epic's first cut never covered. I grew `covers` to add those two
  domain nodes and the two port constraints that state the adapter-is-interchangeable fact the
  test actually relies on.
covers:
  - contracts/system/guided-diagnosis
  - contracts/investigation/diagnosis
  - constraints/diagnosis-answers-synchronously
  - domain/investigation/assessment
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/assessment-consolidator
  - constraints/judgment-runs-behind-a-port
  - constraints/consolidation-runs-behind-a-port
sources:
  - intake/scope.md
---

## What it is

One HTTP endpoint exposes the diagnose operation the system already knows how to run.
One automated test proves the whole path from request to written record, without needing a live model credential in CI.

## Notes

None.
