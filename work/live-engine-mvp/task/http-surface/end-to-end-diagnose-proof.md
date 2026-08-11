---
title: Prove the whole diagnose flow end to end, without a live provider
summary: One automated test sends an HTTP request against the fixture case and asserts collection, judgment, consolidation and writing all ran, with the LLM ports replaced by fakes.
rationale: The scope asks for one test proving the whole flow; I made it depend on the HTTP endpoint and the fixture case directly, since it verifies their integration rather than building either, and it can only be demonstrated once both exist.
objective: An automated test exercises the whole synchronous diagnose flow — HTTP request in, collection, judgment, consolidation and writing, assessment out — against the fixture case, with no live provider credential needed.
criteria:
  - The test sends one HTTP request to the diagnose endpoint naming the fixture case, a subject, a narrative and a requester, and asserts the HTTP response carries the assessment.
  - The test substitutes fakes behind the published hypothesis-evaluator and assessment-consolidator ports, so the run makes no call to the Anthropic API.
  - Running the test requires no ANTHROPIC_API_KEY or other live network credential to be present.
  - The test asserts an investigation was written for the request — read back from the file-backed investigation store — before it asserts anything about the HTTP response.
depends_on:
  - task/http-surface/diagnose-http-endpoint
  - task/case-fixture/author-diagnose-fixture-case
implements:
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

One test drives the endpoint with fake LLM adapters standing behind the two published ports.
It is the one place this plan proves the whole path runs together, not just each piece alone.

## Notes

None.
