---
title: Stale specification citations
summary: Comments and constants across nine locations cite a superseded reading of the specification instead of the node as it currently stands.
rationale: The scope describes nine separate stale citations across nine files; none changes observable behavior and all nine share the same cause — same-day specification changes the code's own comments and constants did not follow — so I kept them as one task with one criterion per location rather than nine near-identical tasks. glossary-query, outcome, case-version and a-capability-is-read-only are uncovered because the fix rewrites which node a comment cites, not any of these nodes' own behavior.
covers:
  - contracts/integration/capability-registry
  - constraints/the-capability-identity-read-refuses-an-unregistered-identity
  - rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  - constraints/listings-are-paged
  - rules/integration/an-unclassified-status-ends-unavailable
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - domain/integration/capability-nature
  - domain/integration/capability
  - contracts/glossary/glossary-query
  - domain/glossary/outcome
  - domain/knowledge/case-version
  - rules/integration/a-capability-is-read-only
uncovered:
  - node: contracts/glossary/glossary-query
    why: The glossary citation fix rewrites which node a comment cites; it does not change the read-vocabulary-term, read-concept, list-vocabulary-terms or list-concepts operations this contract publishes.
  - node: domain/glossary/outcome
    why: The comment fix corrects which rule the code cites for the non-conclusion outcomes; it does not add, remove or rename any outcome.
  - node: domain/knowledge/case-version
    why: Same reason as outcome — the citation is corrected, case-version's own attributes and operations are untouched.
  - node: rules/integration/a-capability-is-read-only
    why: The CAPABILITY_NATURES correction fixes the enumeration's own comment; the registry's read-only refusal behavior this rule governs is encoded elsewhere and untouched.
  - node: domain/integration/capability-nature
    why: The binder found CAPABILITY_NATURES's own comment already matches this node's content word-for-word; this epic's task corrects only the neighbouring comment's wrong attribution of the concept field, which domain/integration/capability governs, not this node's own enumeration.
sources:
  - intake/scope.md
---

## What it is

Nine comments or constants across nine files are corrected to reflect what the specification currently states rather than a superseded reading.
None of the nine changes what a person using the system can learn or do.

## Notes

None.
