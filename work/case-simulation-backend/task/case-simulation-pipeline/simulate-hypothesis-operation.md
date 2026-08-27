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
  - The route is registered following the routePlugins()/BuildAppDependencies/buildAppDependencies() convention and is reachable through diagnose-server.factory.ts's composition for a real process.
depends_on:
  - task/case-simulation-pipeline/extract-shared-investigation-pipeline
  - task/case-simulation-pipeline/no-cache-simulation-composition
implements:
  - contracts/investigation/case-simulation
  - rules/investigation/a-simulation-writes-no-investigation
  - rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  - scenarios/investigation/a-single-hypothesis-is-simulated
  - scenarios/investigation/a-simulation-never-enters-the-cache
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  - domain/investigation/evaluation
  - domain/investigation/citation
  - domain/investigation/verdict
  - domain/investigation/evaluation-reason
  - domain/investigation/usage
  - domain/investigation/evidence
  - domain/investigation/evidence-result
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
---

## What it is

simulate-hypothesis.dto.ts, the /v1/simulate/hypothesis route, and a controller calling collectEvidence restricted to the named revision's own collects plus judgeHypotheses over that one required hypothesis, with no resolveAndNarrow or draftAssessment call.

## Notes

BLOCKING, from the specification — the original criterion "the response's durations carry collection, judgment and total only, with no writing field" contradicts `domain/investigation/durations`, whose four attributes (collection, judgment, writing, total) are each declared `required: true` unconditionally, with no conditional-presence language of the kind `domain/investigation/evaluation` and `domain/investigation/assessment` use for their own call-level optional/always-required fields. The node states `writing` as always present; this task's own design (§5.2 of the source document, faithfully carried into this plan's scope) demands its absence for a `simulate-hypothesis` response, since no writing/consolidation call ever runs for this operation. The criterion has been dropped from this task pending resolution — this task does not, as written, state what its own response's durations look like. A human settles this: either `domain/investigation/durations`'s `writing` attribute becomes optional (present exactly when a consolidation call ran, the same pattern `evaluation`'s own optional fields already use), which would need to go back through `/analyse`, or `simulate-hypothesis` is decided to report a durations shape distinct from `domain/investigation/durations` altogether — a second decision `/analyse` would also need to make. Until one of these lands, this task is not ready to implement.
