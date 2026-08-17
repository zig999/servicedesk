---
title: IGlossaryQuery gains listVocabularyTerms
summary: A new query operation returning every term one named vocabulary currently holds.
objective: IGlossaryQuery gains a listVocabularyTerms operation returning every term one named vocabulary currently holds.
criteria:
  - Calling listVocabularyTerms with an existing vocabulary name returns every term that vocabulary currently holds, paginated per src/types/pagination.ts.
  - Calling listVocabularyTerms with a vocabulary name the glossary does not recognize is refused with the same typed error the existing read-vocabulary-term operation already raises for an unrecognized vocabulary.
depends_on:
  - task/case-query-http/pagination-types
implements:
  - contracts/glossary/glossary-query
  - domain/glossary/subject-type
  - domain/glossary/action
  - domain/glossary/recipient
  - domain/glossary/outcome
  - domain/glossary/subject-attribute
sources:
  - intake/scope.md
---

## What it is

A new read-only IGlossaryQuery method, listVocabularyTerms, spanning subject-type, action, recipient, outcome and subject-attribute.

## Notes

None.
