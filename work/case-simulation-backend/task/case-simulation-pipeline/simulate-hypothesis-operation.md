---
title: POST /v1/simulate/hypothesis returns one hypothesis's own evaluation
summary: The simulate-hypothesis DTO, route and controller restrict collection to one named hypothesis's own revision and return exactly one evaluation, with no outcome or assessment resolved.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: A curator can POST /v1/simulate/hypothesis for one named hypothesis and receive that hypothesis's own evaluation and the evidence its revision collects, with no outcome or assessment resolved.
criteria:
  - A simulate-hypothesis call restricts collection to only the concepts the named hypothesis's own revision collects.
  - Exactly one evaluation returns, for the named hypothesis.
  - No resolved outcome and no assessment are returned.
  - A hypothesis name absent from the version's manifest is refused with an HTTP 404 response reporting a HypothesisNotInManifestError.
  - A subject with no attribute-values is refused, applying the same rule diagnose applies.
  - A subject attribute-value naming an attribute outside the glossary is refused, applying the same rule diagnose applies.
  - No investigation is written and nothing collected enters a cache.
  - "The response's durations carry collection and judgment; writing is absent, since this operation never reaches consolidation."
  - The route is registered following the routePlugins()/BuildAppDependencies/buildAppDependencies() convention and is reachable through diagnose-server.factory.ts's composition for a real process.
depends_on:
  - task/case-simulation-pipeline/extract-shared-investigation-pipeline
  - task/case-simulation-pipeline/no-cache-simulation-composition
implements:
  - contracts/investigation/case-simulation
  - rules/investigation/a-simulation-writes-no-investigation
  - rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  - scenarios/investigation/a-simulation-never-enters-the-cache
  - scenarios/investigation/a-single-hypothesis-is-simulated
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  - domain/investigation/citation
  - domain/investigation/verdict
  - domain/investigation/evidence-result
  - domain/investigation/evaluation-reason
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/investigation/assessment
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/investigation/usage
  - domain/investigation/durations
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
---

## What it is

simulate-hypothesis.dto.ts, the /v1/simulate/hypothesis route, and a controller calling collectEvidence restricted to the named revision's own collects plus judgeHypotheses over that one required hypothesis, with no resolveAndNarrow or draftAssessment call.

## Notes

The eighth criterion's durations shape was BLOCKING through two earlier rounds of this task's own binding: `domain/investigation/durations` declared `writing` required unconditionally, contradicting an operation that never reaches consolidation. Resolved via `/analyse` — `writing` is now optional on `durations`, present exactly when a consolidation call happened, mirroring `domain/investigation/evaluation`'s own conditional per-call attributes. Logged at `domain/investigation/durations.md`/`attributes.writing.required`.
REMAINDER, from the specification — `rules/investigation/the-response-follows-the-record` ("the response leaves whole and only after the investigation is written") is a candidate here, but its premise never arises: this operation writes no investigation at all, per `rules/investigation/a-simulation-writes-no-investigation`, already answered by this task's own seventh criterion. Belongs to the diagnose entry point, the operation that actually writes an investigation and whose response ordering this rule governs.
