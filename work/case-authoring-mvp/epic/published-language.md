---
title: Published language
summary: The glossary's four vocabularies and its concepts, held as plain data and answered by the published glossary read.
rationale: The scope named the glossary reads the contract check requires but stated no grouping; the vocabulary data and its read are grouped as one epic because every glossary fact sits behind one seam, and the plan's build-substrate task sits here because an epic must claim at least one specification node and this epic's tasks are the dependency roots of the plan.
covers:
  - domain/glossary/subject-type
  - domain/glossary/outcome
  - domain/glossary/action
  - domain/glossary/recipient
  - domain/glossary/concept
  - rules/glossary/a-recipient-is-a-role
  - rules/glossary/an-action-names-what-its-recipient-does
  - rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - contracts/glossary/glossary-query
  - constraints/the-mvp-persists-to-no-database
  - constraints/the-domain-depends-on-no-infrastructure
uncovered:
  - node: rules/glossary/a-recipient-is-a-role
    why: Every contract this plan builds over the glossary is a read; no write path exists to refuse a term, and whether a name is a role or a person is a curation judgment no code check decides.
  - node: rules/glossary/an-action-names-what-its-recipient-does
    why: The rule governs when a curator adds a term to the vocabulary, not any read this plan builds, and no write path exists here to apply it.
  - node: rules/glossary/an-outcome-is-contributed-by-a-confirmable-hypothesis
    why: The impact set publishes only reads over the glossary, so outcomes enter by curation of the glossary's data and this plan builds no registration path that could encode the contribution.
sources:
  - intake/scope.md
---
## What it is
The published language of the system: subject types, outcomes, actions, recipients and concepts, existing exactly once each, persisted as plain JSON data and resolved through the published glossary-query read.
It also hosts the one task the scope did not ask for, the build substrate the project's standard presupposes.

## Notes
None.
