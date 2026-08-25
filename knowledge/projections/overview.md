# Specification overview

Derived by spec.py from the specification files; never edited.

## Contexts

| context | strategic | elements | rules | contracts | scenarios |
|---|---|---|---|---|---|
| glossary | supporting | 6 | 4 | 2 | 0 |
| integration | generic | 5 | 8 | 6 | 0 |
| investigation | supporting | 14 | 20 | 6 | 6 |
| knowledge | core | 10 | 27 | 4 | 5 |

## Capabilities

- case-authoring — unmapped: no scenario names it and no contract consumes it
- corporate-records — consumed by integration
- guided-diagnosis — unmapped: no scenario names it and no contract consumes it

## Constraints

- a-case-is-read-whole (knowledge)
- consolidation-runs-behind-a-port (investigation)
- diagnosis-answers-synchronously (system)
- evidence-normalization-is-an-anticorruption-layer (integration)
- hypotheses-are-judged-in-isolated-parallel-calls (investigation)
- judgment-runs-behind-a-port (investigation)
- no-route-enforces-authentication (system)
- the-capability-identity-read-is-rate-limited (integration)
- the-capability-identity-read-refuses-an-unregistered-identity (integration)
- the-consolidation-prompt-is-closed (investigation)
- the-database-is-externally-provisioned (system)
- the-deadline-is-an-absolute-propagated-instant (investigation)
- the-domain-depends-on-no-infrastructure (system)
- the-evidence-cache-admits-only-ok-results (investigation)
- the-judgment-prompt-is-closed (investigation)
- the-schema-replays-from-its-scripts (system)
- the-stored-schema-mirrors-the-declared-model (system)
- the-system-persists-to-one-relational-database (system)

90 decision(s) disclosed in the decision log.
