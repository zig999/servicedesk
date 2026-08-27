---
title: POST /v1/simulate returns the complete record without writing an investigation
summary: The simulate-case DTO, route and controller run the shared pipeline over a case version in either state and return evidence, evaluations, resolved outcome, assessment, cost and durations.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: A curator can POST /v1/simulate over a case version in draft or released state and receive the complete record — evidence, evaluations, resolved outcome, assessment, cost and durations — without an investigation being written.
criteria:
  - A simulate-case call over a case version in draft state returns the complete record — evidence, evaluations, resolved outcome, assessment, cost and durations.
  - A simulate-case call over a case version in released state likewise returns the complete record.
  - No investigation is written and no investigation-completed event is emitted by a simulate-case call.
  - A subject with no attribute-values is refused, applying the same rule diagnose applies.
  - A subject attribute-value naming an attribute outside the glossary is refused, applying the same rule diagnose applies.
  - An unknown case slug or version is refused, reusing case-query's own errors.
  - The response carries no narrative field and no ticket reference field.
  - The route is registered following the routePlugins()/BuildAppDependencies/buildAppDependencies() convention and is reachable through diagnose-server.factory.ts's composition for a real process.
depends_on:
  - task/case-simulation-pipeline/extract-shared-investigation-pipeline
  - task/case-simulation-pipeline/no-cache-simulation-composition
implements:
  - contracts/investigation/case-simulation
  - rules/investigation/a-simulation-writes-no-investigation
  - scenarios/investigation/a-draft-case-version-is-simulated
  - scenarios/investigation/a-simulation-never-enters-the-cache
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
  - domain/investigation/cost
  - domain/investigation/durations
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
  - domain/knowledge/resolution
  - domain/knowledge/referral
---

## What it is

simulate-case.dto.ts (zod, following diagnose.dto.ts), the /v1/simulate route, and a controller that reads the pinned case through ICaseQuery, calls the no-cache composition, and returns its record unchanged.

## Notes

The response's evaluation objects each carry usage/elapsed_ms/prompt exactly when a judgment call happened, and the response's assessment carries usage/elapsed_ms/prompt/register unconditionally, per what the widened port, the judgment stage and `domain/investigation/assessment` already produce.
UNDERDETERMINED, from the specification — a simulate-case implementation whose collection stage writes each collected concept's `ok` evidence result into the same cache diagnose's own collection stage reads from and writes to (or reads a prior diagnosis's cached `ok` result instead of observing the concept again), while still returning the complete record, still writing no investigation and still emitting no investigation-completed event, would satisfy every criterion listed above — none of which mentions the cache. A test proving this task's criteria must also exclude that implementation: `rules/investigation/a-simulation-writes-no-investigation` and `scenarios/investigation/a-simulation-never-enters-the-cache` still refuse it, enforced by `no-cache-simulation-composition`'s own composition, which this task must actually use.
