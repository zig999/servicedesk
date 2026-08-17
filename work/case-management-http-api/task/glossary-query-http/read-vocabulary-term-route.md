---
title: GET /v1/glossary/{vocabulary}/{name}
summary: The HTTP route exposing the existing read-vocabulary-term domain operation.
objective: GET /v1/glossary/{vocabulary}/{name} exposes the existing read-vocabulary-term domain operation over HTTP.
criteria:
  - A valid request returns the named term exactly as the glossary currently holds it.
  - A request naming a term the glossary does not hold is refused with the status status-map assigns.
depends_on:
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

A thin Fastify plugin, controller and Zod DTO wired to the existing read-vocabulary-term operation.

## Notes

Criterion 2's status refusal is not a specification silence: the specification already answers the term with `{ held: false }` rather than an error (IGlossaryQuery's own read-vocabulary-term contract), and which transport status that unheld answer becomes is the standard's own COR-04 concern, resolved by task/case-lifecycle-http/status-map, not a domain fact this specification would state.
