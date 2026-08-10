---
title: Evidence collection
summary: Parallel, scoped, budgeted collection of one evidence per concept in the pinned case's plan, behind a new observation-source port and its fake test adapter.
rationale: The scope names a fake adapter explicitly only for hypothesis-evaluator; this epic extends the same port-plus-fake pattern to collection's own infrastructure dependency, because the-domain-depends-on-no-infrastructure binds every infrastructure edge, not only the one the scope called out by name. A real connector implementing that port against actual source systems is a distinct remainder this epic does not build, matching how a real LLM adapter is left to hypothesis-judgment's own remainder — no connector spec or per-capability integration detail sits in this impact set to build against.
covers:
  - domain/investigation/evidence
  - domain/investigation/evidence-result
  - rules/investigation/collection-runs-in-the-requester-scope
  - rules/investigation/one-evidence-per-collected-concept
  - rules/investigation/collection-has-its-own-budget-within-the-total
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/integration/evidence-arrives-in-the-glossary-vocabulary
  - scenarios/investigation/a-collection-timeout-degrades-to-no-data
  - scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  - contracts/investigation/observation-source
  - contracts/investigation/glossary-source
  - contracts/integration/concept-observation
  - contracts/integration/capability-registry
  - contracts/glossary/glossary-query
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - constraints/the-evidence-cache-admits-only-ok-results
  - constraints/the-domain-depends-on-no-infrastructure
uncovered:
  - node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
    why: Normalizing into the glossary's vocabulary is what the observation-source contract already promises at the boundary; the collection stage records what arrives and builds no normalizer of its own.
  - node: contracts/investigation/glossary-source
    why: No task in this epic calls the glossary directly. The pinned case already resolved every glossary reference it needed before this engine ever runs, and the inventory found glossary reachable only through that existing composition (role adjacent), never as a direct dependency of the investigation module.
  - node: contracts/glossary/glossary-query
    why: The glossary context's own published read is already delivered by an earlier plan; this epic touches no part of publishing it, and reaches it nowhere directly (see glossary-source above).
  - node: contracts/integration/capability-registry
    why: Resolving a capability from a concept is the capability-registry's own already-delivered read; observation-source's own call is observe-concept alone, with capability resolution happening at the integration edge, never inside this epic's tasks.
  - node: constraints/the-evidence-cache-admits-only-ok-results
    why: No evidence cache is built in this MVP. The scope names no cache, and the constraint itself calls caching a day-two lever rather than an MVP requirement.
sources:
  - intake/scope.md
---

## What it is

The collection stage that turns a case's collection plan into recorded evidence.
It runs every capability call in parallel, in the requester's own scope, clamped to the smaller of the collection budget and whatever remains of the request's deadline.
A non-ok ending is data the stage records, never a failure it raises.

## Notes

None.
