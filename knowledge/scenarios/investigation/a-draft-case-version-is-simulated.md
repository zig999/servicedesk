---
subject: rules/investigation/a-simulation-writes-no-investigation
given:
  - a case version exists in draft state
  - a subject with at least one attribute
when:
  - a simulation of the case is requested
then:
  - the engine collects, judges, resolves and drafts the assessment
  - the response carries every evaluation with its verdict and citations, every evidence item with its result, the cost and the durations
  - no investigation is written
involves:
  - domain/knowledge/case-version
  - contracts/investigation/case-simulation
---

## Description

A draft may already be under revision and still worth judging end to end before a curator commits to releasing it — this is exactly that read, run for real, on a version a diagnosis would refuse outright.
