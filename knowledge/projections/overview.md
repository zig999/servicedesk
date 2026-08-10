# Specification overview

Derived by spec.py from the specification files; never edited.

## Contexts

| context | strategic | elements | rules | contracts | scenarios |
|---|---|---|---|---|---|
| glossary | supporting | 6 | 4 | 1 | 0 |
| integration | generic | 3 | 4 | 4 | 0 |
| investigation | supporting | 14 | 20 | 6 | 6 |
| knowledge | core | 5 | 15 | 3 | 3 |

## Capabilities

- case-authoring
- corporate-records
- guided-diagnosis

## Constraints

- a-case-is-stored-as-one-json-document (knowledge)
- consolidation-runs-behind-a-port (investigation)
- diagnosis-answers-synchronously (system)
- evidence-normalization-is-an-anticorruption-layer (integration)
- hypotheses-are-judged-in-isolated-parallel-calls (investigation)
- in-progress-is-a-lease-not-domain-state (investigation)
- judgment-runs-behind-a-port (investigation)
- the-consolidation-prompt-is-closed (investigation)
- the-deadline-is-an-absolute-propagated-instant (investigation)
- the-domain-depends-on-no-infrastructure (system)
- the-evidence-cache-admits-only-ok-results (investigation)
- the-judgment-prompt-is-closed (investigation)
- the-mvp-persists-to-no-database (system)

49 decision(s) disclosed in the decision log.
