---
contract_version: siegard-reconcile/1
title: Backend final sweep — glossary.service.ts
summary: 'Same premise as backend-final-sweep-a.md, reconciled separately for this one file: its own judge
  returned two findings against candidate-attributed nodes also bound (cleanly) to five other files in
  that batch, so this file is reconciled alone to avoid folding an unrelated finding onto files otherwise
  clean for the same node.'
target: backend
files:
- path: src/glossary/glossary.service.ts
  change: unchanged this round
nodes:
- node: constraints/listings-are-paged
  conforms: true
  how: listVocabularyTerms/listConcepts/pageCountOf read offset/limit from the caller's PaginationRequest,
    quoting the constraint's own text for the non-positive-limit case.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: registerConcept's create-or-replace-in-place shape matches the node.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: contracts/glossary/glossary-query
  conforms: true
  how: readVocabularyTerm/readConcept/listVocabularyTerms/listConcepts each match a declared operation.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/action
  conforms: true
  how: handled as an ordinary named vocabulary via terms(), no action-specific logic needed or present.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/concept
  conforms: true
  how: concepts()/registerConcept build { name, accepts, ttl } per registration, matching the node.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/outcome
  conforms: true
  how: withNonConclusionOutcomes adds the two non-conclusion outcomes through the port's additive primitive.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/recipient
  conforms: true
  how: handled as an ordinary named vocabulary via terms(), no recipient-specific logic needed or present.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: handled as an ordinary named vocabulary via terms(), no subject-attribute-specific logic needed
    or present.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: domain/glossary/subject-type
  conforms: true
  how: handled via terms() and concepts()'s accepts field.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: withNonConclusionOutcomes adds only what is missing, never deleting or rewriting an already-held
    row.
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/knowledge/a-collected-concept-declares-a-ttl
  conforms: true
  how: 'concepts()/registerConcept carry ttl: registration.ttl ?? DEFAULT_CONCEPT_TTL_SECONDS, matching
    the node.'
  encoded_at:
  - src/glossary/glossary.service.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: false
  how: 'assertUniqueNames refuses a duplicate name and throws DuplicateGlossaryNameError, matching the
    node''s behavior exactly, but — unlike every other rule this file applies — the citation is missing:
    no comment here points a reader to rules/glossary/a-vocabulary-holds-each-name-once. Out of scope
    for this initiative''s 6 tracked findings; left unbound as an open item for a future citation task.'
  observed_at:
  - src/glossary/glossary.service.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: false
  how: The class doc comment states "Persistence reaches it only through the store port, so this module
    stays importable without any infrastructure" — true, and consistent with the constraint, but uncited,
    unlike this file's other architecture-adjacent claims. Out of scope for this initiative's 6 tracked
    findings; left unbound as an open item. (This node is also bound, cleanly, to five other files reconciled
    separately in backend-final-sweep-a.md — this entry concerns only this file's own citation gap and
    does not reopen those.)
  observed_at:
  - src/glossary/glossary.service.ts
notes: One specification-conformance-reviewer delegation over this one file, handed its own 11-node trace-bound
  set plus the same batch candidate union backend-final-sweep-a.md used. 9 of 11 nodes clear; 2 candidate-attributed
  findings (citation gaps, not behavioral departures) stay unbound, both outside this initiative's 6 tracked
  findings.
---
