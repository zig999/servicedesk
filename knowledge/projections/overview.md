# Specification overview

Derived by spec.py from the specification files; never edited.

## Contexts

| context | strategic | elements | rules | contracts | scenarios |
|---|---|---|---|---|---|
| glossary | supporting | 6 | 10 | 2 | 1 |
| integration | generic | 5 | 16 | 6 | 3 |
| investigation | supporting | 16 | 37 | 7 | 17 |
| knowledge | core | 12 | 48 | 5 | 12 |

## Capabilities

- case-authoring — unmapped: no scenario names it and no contract consumes it
- corporate-records — consumed by integration
- guided-diagnosis — unmapped: no scenario names it and no contract consumes it

## Constraints

- a-case-is-read-whole (knowledge)
- a-domain-error-unmapped-by-status-is-refused-generically (system)
- a-malformed-request-is-refused-with-a-validation-error (system)
- consolidation-runs-behind-a-port (investigation)
- diagnosis-answers-synchronously (system)
- evidence-normalization-is-an-anticorruption-layer (integration)
- hypotheses-are-judged-in-isolated-parallel-calls (investigation)
- judgment-runs-behind-a-port (investigation)
- listings-are-paged (system)
- no-route-enforces-authentication (system)
- the-capability-identity-read-is-rate-limited (integration)
- the-capability-identity-read-refuses-an-unregistered-identity (integration)
- the-concept-read-refuses-an-unanswered-concept (integration)
- the-consolidation-prompt-is-closed (investigation)
- the-database-is-externally-provisioned (system)
- the-deadline-is-an-absolute-propagated-instant (investigation)
- the-domain-depends-on-no-infrastructure (system)
- the-evidence-cache-admits-only-ok-results (investigation)
- the-judgment-prompt-is-closed (investigation)
- the-schema-replays-from-its-scripts (system)
- the-stored-schema-mirrors-the-declared-model (system)
- the-system-persists-to-one-relational-database (system)

197 decision(s) disclosed in the decision log.
