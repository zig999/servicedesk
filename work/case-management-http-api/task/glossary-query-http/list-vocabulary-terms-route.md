---
title: GET /v1/glossary/{vocabulary}
summary: The HTTP route exposing the new listVocabularyTerms query operation.
objective: GET /v1/glossary/{vocabulary} exposes the new listVocabularyTerms query operation over HTTP.
criteria:
  - A valid request against a recognized vocabulary returns a paginated page of every term it currently holds.
  - A request naming a vocabulary the glossary does not recognize is refused with the status status-map assigns.
depends_on:
  - task/glossary-query-http/list-vocabulary-terms-query-extension
  - task/case-query-http/pagination-types
  - task/case-lifecycle-http/status-map
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

A thin Fastify plugin, controller and Zod DTO over the new listVocabularyTerms query operation.

## Notes

Criterion 2's status refusal is not a specification silence: the same typed error read-vocabulary-term already raises for an unrecognized vocabulary is reused here, and which transport status it becomes is the standard's own COR-04 concern, resolved by task/case-lifecycle-http/status-map, not a domain fact this specification would state.
