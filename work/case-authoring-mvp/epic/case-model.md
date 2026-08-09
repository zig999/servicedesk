---
title: Case model
summary: The case aggregate as one JSON document with its structural rules, its cross-context coherence checks, and its own resolution operations.
rationale: The scope named the case model and the validator with all knowledge-context rules but stated no cut between them; the epic groups the aggregate, both halves of the validator and the case's declared operations, because all of them answer for the same document.
covers:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - rules/knowledge/the-slug-matches-the-file-name
  - rules/knowledge/a-case-has-at-least-one-hypothesis
  - rules/knowledge/a-hypothesis-name-is-unique-within-its-case
  - rules/knowledge/a-hypothesis-collects-at-least-one-concept
  - rules/knowledge/a-hypothesis-declares-a-criterion
  - rules/knowledge/every-position-declares-a-resolution
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - rules/knowledge/one-falsifiable-claim-per-criterion
  - rules/knowledge/case-terms-exist-in-the-glossary
  - rules/knowledge/a-concept-accepts-the-declared-subject-type
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - contracts/knowledge/vocabulary-terms
  - contracts/knowledge/capability-check
  - scenarios/knowledge/a-subject-mismatch-refuses-the-case
  - scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  - scenarios/knowledge/no-confirmation-falls-back
  - contracts/system/case-authoring
  - constraints/a-case-is-stored-as-one-json-document
  - constraints/the-domain-depends-on-no-infrastructure
uncovered:
  - node: rules/knowledge/one-falsifiable-claim-per-criterion
    why: The rule's own text assigns its verification to human review, not the validator, so no code check in this plan decides whether a criterion states one claim.
sources:
  - intake/scope.md
---
## What it is
The core of the scope: the aggregate parsed whole from one JSON document, the structural rules that hold against the document alone, the coherence rules that read the current glossary and registry, and the resolution logic the case owns.

## Notes
None.
