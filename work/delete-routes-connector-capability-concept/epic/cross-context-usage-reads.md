---
title: Reading whether a registry name is still named elsewhere
summary: The reader ports the two guarded removals need, so the capability registry and the glossary can
  learn whether an evidence item, a citation, a hypothesis-revision's collects or a registered capability
  still names what is about to be removed.
rationale: 'Cut as its own epic rather than folded into the two guarded removals because the second inventory
  node names this as a missing dependency between modules rather than new code inside one, and because
  the reads it introduces are an interface whose consumers are the removal operations — a task changing
  an interface and its consumers in one breath is two tasks. The overlap with the capability epic on domain/integration/capability
  is deliberate: the reader reads a capability''s own concept attribute, and the removal removes a capability''s
  own registration, so both epics'' tasks may need to name it.'
sources:
- intake/scope.md
covers:
- domain/investigation/evidence
- domain/investigation/citation
- domain/knowledge/hypothesis-revision
- domain/integration/capability
- constraints/the-domain-depends-on-no-infrastructure
- constraints/the-evidence-cache-admits-only-ok-results
- constraints/hypotheses-are-judged-in-isolated-parallel-calls
- constraints/judgment-runs-behind-a-port
- constraints/the-judgment-prompt-is-closed
- constraints/consolidation-runs-behind-a-port
- constraints/the-consolidation-prompt-is-closed
- constraints/diagnosis-answers-synchronously
- constraints/the-deadline-is-an-absolute-propagated-instant
- constraints/the-diagnosis-and-simulation-routes-are-rate-limited
- constraints/evidence-normalization-is-an-anticorruption-layer
uncovered:
- node: constraints/the-evidence-cache-admits-only-ok-results
  why: Governs what enters a cache at collection time; a read asking whether recorded evidence names a
    registry name neither reads nor fills a cache, and no task here touches collection.
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  why: The judgment stage is untouched — only the evidence and citations a finished investigation already
    recorded are read.
- node: constraints/judgment-runs-behind-a-port
  why: Same reason; the judgment port and its adapters are not reached by any task in this plan.
- node: constraints/the-judgment-prompt-is-closed
  why: No prompt is assembled, read or changed by a usage read.
- node: constraints/consolidation-runs-behind-a-port
  why: The consolidation port and its adapters are not reached by any task in this plan.
- node: constraints/the-consolidation-prompt-is-closed
  why: No prompt is assembled, read or changed by a usage read.
- node: constraints/diagnosis-answers-synchronously
  why: Diagnosis's own request path is untouched; the removals are their own routes.
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  why: No stage budget or deadline propagation is involved in a removal or in the reads it needs.
- node: constraints/the-diagnosis-and-simulation-routes-are-rate-limited
  why: Names the diagnosis and simulation routes; the specification states no limit for any removal route
    and this plan invents none.
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  why: Governs translation at the integration edge when an observation arrives; a usage read over already-recorded
    evidence performs no translation.
---

## What it is
One epic for the reads the two guarded removals depend on and the unconditional one does not.
It introduces the ports through which the capability registry learns whether a collected evidence item still names a capability identity, and the glossary learns whether anything still names a concept.
Each read is declared as a port in the module that consumes it and implemented against the relational store that holds the data, the shape `IConnectorConfigurationsReader` and `ICapabilitiesReader` already establish for deciding a refusal against another module's data.

## Notes
The two reader ports here are what the surveyor's second inventory node names as genuinely absent: no reader port from `capability-registry` or `glossary` into case or investigation data exists today.
`remove-connector` depends on nothing in this epic, its governing rule being unconditional.
