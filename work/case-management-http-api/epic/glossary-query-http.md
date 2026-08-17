---
title: Glossary query HTTP surface
summary: The two new listing extensions to IGlossaryQuery and the four HTTP routes that resolve or list a vocabulary term or a concept.
rationale: Groups the four glossary-query operations the scope's table (§0) names together with the five discovered, global and contributed vocabularies (subject-type, action, recipient, outcome, subject-attribute) and the concept vocabulary that read-vocabulary-term, list-vocabulary-terms, read-concept and list-concepts jointly resolve. domain/glossary/concept is claimed here and again by capability-registry-http, since a capability answers exactly one concept — overlap declared rather than an error.
covers:
  - contracts/glossary/glossary-query
  - domain/glossary/subject-type
  - domain/glossary/concept
  - domain/glossary/action
  - domain/glossary/recipient
  - domain/glossary/outcome
  - domain/glossary/subject-attribute
sources:
  - intake/scope.md
---

## What it is

Two new read-only IGlossaryQuery operations: listVocabularyTerms, listConcepts.
Four HTTP routes: read-vocabulary-term, read-concept (already domain operations), list-vocabulary-terms, list-concepts.

## Notes

None.
