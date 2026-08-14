---
title: HTTP observation runtime
summary: The generic adapter that executes a registered connector's HTTP call and the production wiring that puts it behind the observation-source port.
rationale: This epic holds everything that executes an already-registered connector at collection time — building the request, running the call, reading the response, and wiring the result into production — kept apart from connector-registration's validated write path because registering a connector and executing one change for different reasons.
sources:
  - intake/scope.md
covers:
  - contracts/investigation/observation-source
  - contracts/integration/concept-observation
  - contracts/integration/capability-registry
  - contracts/system/corporate-records
  - contracts/integration/corporate-records-source
  - domain/investigation/evidence
  - domain/investigation/evidence-result
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/investigation/investigation
  - domain/investigation/durations
  - domain/integration/capability-registry
  - domain/integration/capability
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/one-evidence-per-collected-concept
  - rules/investigation/collection-has-its-own-budget-within-the-total
  - rules/investigation/an-answer-arrives-within-the-declared-deadline
  - rules/investigation/collection-runs-in-the-requester-scope
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - rules/integration/evidence-arrives-in-the-glossary-vocabulary
  - scenarios/investigation/a-collection-timeout-degrades-to-no-data
  - scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  - scenarios/investigation/a-foreign-citation-is-refused
  - constraints/the-domain-depends-on-no-infrastructure
  - constraints/evidence-normalization-is-an-anticorruption-layer
  - constraints/the-evidence-cache-admits-only-ok-results
uncovered:
  - node: contracts/integration/capability-registry
    why: The read-capability operation is already implemented by capability-registry.service.ts; this plan adds a new caller of it, not a new implementation.
  - node: domain/investigation/evidence
    why: Evidence is assembled by evidence-collection-stage.ts, unmodified by this plan; the adapter only supplies the outcome that stage already knows how to fold into an Evidence.
  - node: domain/investigation/subject
    why: Subject's shape is unchanged; the resolver reads its existing attributes and adds none.
  - node: domain/investigation/subject-attribute-value
    why: Unchanged; read by the resolver as already assembled by the entry point.
  - node: domain/investigation/investigation
    why: Investigation's own assembly of evidence, evaluations, assessment, cost and durations is untouched; this plan supplies data at one collection call the stage already orchestrates.
  - node: domain/investigation/durations
    why: Stage timing is computed by evidence-collection-stage.ts, unmodified here.
  - node: domain/integration/capability-registry
    why: register-capability and resolve-concept are unchanged; the adapter is a new caller of resolve-concept, not a new implementation of it.
  - node: rules/investigation/one-evidence-per-collected-concept
    why: Cardinality of evidence per concept is decided by the collection plan and evidence-collection-stage, unchanged; the adapter answers one call per invocation.
  - node: rules/investigation/an-answer-arrives-within-the-declared-deadline
    why: The twenty-second total deadline is an orchestration guarantee across every stage, unchanged; this plan only keeps the adapter's own call inside the bound the collection stage already enforces.
  - node: rules/investigation/a-subject-carries-at-least-one-attribute
    why: Enforced at Subject assembly by the entry point, unchanged; the adapter and resolver assume an already-valid Subject.
  - node: scenarios/investigation/a-foreign-citation-is-refused
    why: Concerns the hypothesis-evaluator and citation-validation.ts, unrelated to how the adapter executes a call.
  - node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
    why: The seven-second collection-wide budget clamp this scenario demonstrates is evidence-collection-stage.ts's existing, unchanged orchestration; the adapter task's own criteria leave that call site untouched, and only bound the adapter's own client-side timeout by the capability's declared timeout, never by the collection stage's remaining budget.
  - node: constraints/the-evidence-cache-admits-only-ok-results
    why: No evidence cache exists in this codebase and this plan does not add one; the constraint has nothing here to bind yet.
---

## What it is

The generic HTTP adapter that answers IObservationSource for any registered connector, purely from configuration.
The two data-transform pieces the adapter composes — substituting placeholders into a request, and extracting a response into the glossary's vocabulary.
The production wiring that puts this adapter, instead of the fixture-backed fake, behind the port in production.

## Notes

This epic depends on connector-registration's descriptor existing to read at call time, but does not itself validate a descriptor.
The scope's own pseudocode, descriptor JSON format and JSONPath syntax are explicitly marked non-binding; only the port's existing contract (the four endings, the timeout bound, the vocabulary boundary) binds the tasks here.
