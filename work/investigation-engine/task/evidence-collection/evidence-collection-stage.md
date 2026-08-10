---
title: Parallel, budgeted evidence collection over the case's plan
summary: Collects one evidence per concept in the pinned case's collection plan, in parallel, within the requester's scope and the collection stage's own budget.
objective: Given a pinned case, a subject and a requester scope, the stage produces exactly one Evidence per concept in the case's collection plan, within whichever of the stage's nominal budget or the propagated remaining time is smaller.
criteria:
  - Every concept in the case's collection plan produces exactly one Evidence, and no concept produces more than one.
  - Collection calls observe-concept once per concept, in parallel, never serially.
  - A capability whose observation has not returned by the collection stage's own budget (or whatever remains of the propagated deadline, whichever is smaller) is recorded as evidence with result timeout at that mark, never waiting for the capability's own longer declared timeout.
  - Every observation call carries the requester's own scope, never the service's.
  - A non-ok ending (unavailable, denied or timeout) is recorded as the evidence's result and never raised as a thrown failure that aborts the stage.
depends_on:
  - task/evidence-collection/observation-source-port
rationale: Splitting the port (and its fake) from the stage that calls it in parallel under a budget keeps the two changing for different reasons — the port's shape changes when what a connector can promise changes, the stage's orchestration changes when the budget or parallelism policy changes.
implements:
  - domain/investigation/evidence
  - domain/investigation/evidence-result
  - rules/investigation/collection-runs-in-the-requester-scope
  - rules/investigation/one-evidence-per-collected-concept
  - rules/investigation/collection-has-its-own-budget-within-the-total
  - rules/investigation/no-stage-aborts-on-its-deadline
  - scenarios/investigation/a-collection-timeout-degrades-to-no-data
  - scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  - contracts/investigation/observation-source
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The orchestration that turns a case's collection plan into one evidence record per concept.
It resolves each concept's capability through the existing capability-registry read, then calls the observation-source port in parallel under the collection budget.

## Notes

ADVISORY, from the specification — constraints/the-deadline-is-an-absolute-propagated-instant states three clauses; only "every stage receives the minimum of its nominal budget and the remaining time" backs this task. Recording the absolute deadline at request entry and keeping the internal total below the caller's timeout are whole-request properties this one stage's task cannot demonstrate alone.
REMAINDER, from the specification — the clause "judgment records deadline-exceeded" of rules/investigation/no-stage-aborts-on-its-deadline governs the judgment stage, not collection. Belongs to task/hypothesis-judgment/judgment-stage.
REMAINDER, from the specification — the clause "persistence as the single declared exception, whose failure is an error to the requester" of the same rule governs the persistence stage. Belongs to task/investigation-lifecycle/investigation-store and task/investigation-lifecycle/diagnose-entry-point.
