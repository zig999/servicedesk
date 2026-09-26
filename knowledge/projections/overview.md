# Specification overview

Derived by spec.py from the specification files; never edited.

## Contexts

| context | strategic | elements | rules | contracts | scenarios |
|---|---|---|---|---|---|
| glossary | supporting | 5 | 11 | 2 | 1 |
| integration | generic | 19 | 139 | 9 | 23 |
| investigation | supporting | 16 | 50 | 7 | 19 |
| knowledge | core | 12 | 84 | 5 | 14 |

## Aggregates

- integration/capability — 0 entity(ies) inside, 9 attribute(s) on the root
- investigation/investigation — 0 entity(ies) inside, 13 attribute(s) on the root
- knowledge/case — 0 entity(ies) inside, 2 attribute(s) on the root
- knowledge/case-version — 0 entity(ies) inside, 10 attribute(s) on the root
- knowledge/hypothesis — 0 entity(ies) inside, 1 attribute(s) on the root
- knowledge/hypothesis-revision — 0 entity(ies) inside, 5 attribute(s) on the root

## Capabilities

- case-authoring — unmapped: no scenario names it and no contract consumes it
- corporate-records — consumed by integration
- guided-diagnosis — unmapped: no scenario names it and no contract consumes it

## Constraints

- a-case-is-read-whole (knowledge)
- a-domain-error-unmapped-by-status-is-refused-generically (system)
- a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word (system)
- a-domain-refusals-message-is-written-in-brazilian-portuguese (system)
- a-malformed-request-is-refused-with-a-validation-error (system)
- a-successful-capability-removal-answers-with-no-content (integration)
- a-successful-case-version-discard-answers-with-no-content (knowledge)
- a-successful-case-version-own-record-read-answers-with-http-200 (knowledge)
- a-successful-concept-removal-answers-with-no-content (glossary)
- a-successful-connector-configuration-removal-answers-with-no-content (integration)
- consolidation-runs-behind-a-port (investigation)
- diagnosis-answers-synchronously (system)
- every-screen-discloses-that-authentication-is-unenforced (system)
- evidence-normalization-is-an-anticorruption-layer (integration)
- hypotheses-are-judged-in-isolated-parallel-calls (investigation)
- judgment-runs-behind-a-port (investigation)
- listings-are-paged (system)
- no-route-enforces-authentication (system)
- the-capability-identity-read-is-rate-limited (integration)
- the-capability-identity-read-refuses-an-unregistered-identity (integration)
- the-concept-read-refuses-an-unanswered-concept (integration)
- the-connection-pool-is-bounded-by-configuration (system)
- the-consolidation-prompt-is-closed (investigation)
- the-database-is-externally-provisioned (system)
- the-deadline-is-an-absolute-propagated-instant (investigation)
- the-diagnosis-and-simulation-routes-are-rate-limited (investigation)
- the-domain-depends-on-no-infrastructure (system)
- the-evidence-cache-admits-only-ok-results (investigation)
- the-judgment-prompt-is-closed (investigation)
- the-openapi-document-is-fetched-by-the-backend (integration)
- the-pool-bounds-are-positive-integers (system)
- the-register-capability-route-defers-completeness-to-the-registry (integration)
- the-register-capability-route-defers-the-nature-vocabulary-to-the-registry (integration)
- the-schema-replays-from-its-scripts (system)
- the-stored-schema-mirrors-the-declared-model (system)
- the-system-persists-to-one-relational-database (system)

377 decision(s) disclosed, 12 fact(s) recorded as read in the decision log.
