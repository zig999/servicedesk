---
title: The immutable investigation factory
summary: Builds the whole, pinned, invariant-checked Investigation from a subject, the pinned case's replay data, collected evidence, completed evaluations, the resolved assessment, cost and durations.
objective: Given every completed stage's output, the factory answers one immutable Investigation pinning its replay, or refuses when evidence does not exactly cover the case's collection plan or evaluations do not exactly cover its required hypotheses.
criteria:
  - The factory refuses to build an investigation whose evidence does not cover the case's collection plan exactly once per concept.
  - The factory refuses to build an investigation whose evaluations do not cover the case's required hypotheses exactly once each.
  - The built investigation pins the case by slug, version and hash, the model, the prompt version and the evidence.
  - The built investigation is a plain immutable value with no method that mutates it after construction.
  - The factory module imports no framework, driver or provider client.
depends_on:
  - task/evidence-collection/evidence-collection-stage
  - task/hypothesis-judgment/judgment-stage
  - task/assessment-drafting/draft-assessment-text
rationale: The factory's totality and pinning invariants are one falsifiable objective, independently demonstrable against fixture evidence, evaluations and an assessment, distinct from the stages that produce those inputs and from the store that persists what the factory builds — the same shape as the existing case module's own factory-plus-validator separation.
implements:
  - domain/investigation/investigation
  - domain/investigation/subject
  - domain/investigation/cost
  - domain/investigation/durations
  - rules/investigation/one-evidence-per-collected-concept
  - rules/investigation/one-evaluation-per-required-hypothesis
  - rules/investigation/replay-is-pinned
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The one place that can build a valid Investigation, and the one place that refuses an invalid one.
It answers a plain, already-complete value; no intermediate or partial investigation exists anywhere.

## Notes

REMAINDER, from the specification — rules/investigation/an-answer-arrives-within-the-declared-deadline states the whole-flow deadline policy, not a fact about building the value from already-completed outputs. Belongs to task/investigation-lifecycle/diagnose-entry-point.
REMAINDER, from the specification — rules/investigation/an-investigation-is-idempotent-within-a-window states repeat-request handling, an entry-point concern. Belongs to task/investigation-lifecycle/idempotency-window.
REMAINDER, from the specification — rules/investigation/an-investigation-is-written-once's "written once" and "no intermediate domain state persists" are persistence-store behaviors; its "never mutated" half is already covered by this task's criterion 4. Belongs to task/investigation-lifecycle/investigation-store.
REMAINDER, from the specification — rules/investigation/no-stage-aborts-on-its-deadline's three degradation clauses are none of them the factory's own, since the factory receives evidence and evaluations only after collection and judgment have already produced them. Belongs to task/evidence-collection/evidence-collection-stage, task/hypothesis-judgment/judgment-stage and task/investigation-lifecycle/investigation-store respectively.
REMAINDER, from the specification — rules/investigation/the-response-follows-the-record orders the response against persistence, downstream of the factory's output. Belongs to task/investigation-lifecycle/diagnose-entry-point.
REMAINDER, from the specification — constraints/diagnosis-answers-synchronously states a fact about the entry point's shape, not the factory's construction logic. Belongs to task/investigation-lifecycle/diagnose-entry-point.
REMAINDER, from the specification — constraints/in-progress-is-a-lease-not-domain-state states a fact about the idempotency store, not about the value the factory builds. Belongs to task/investigation-lifecycle/idempotency-window.
REMAINDER, from the specification — constraints/the-deadline-is-an-absolute-propagated-instant states how the deadline is recorded and propagated across stages, an orchestration fact upstream of the factory. Belongs to task/investigation-lifecycle/diagnose-entry-point.
REMAINDER, from the specification — constraints/the-mvp-persists-to-no-database states a persistence-format fact about the store, not about the in-memory value the factory produces. Belongs to task/investigation-lifecycle/investigation-store.
