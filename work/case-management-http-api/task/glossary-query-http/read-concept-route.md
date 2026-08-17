---
title: GET /v1/glossary/concepts/{name}
summary: The HTTP route exposing the existing read-concept domain operation.
objective: GET /v1/glossary/concepts/{name} exposes the existing read-concept domain operation over HTTP.
criteria:
  - A valid request returns the named concept exactly as the glossary currently holds it, including its accepted subject types and its ttl.
  - A request naming a concept the glossary does not hold is refused with the status status-map assigns.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/glossary/glossary-query
  - domain/glossary/concept
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing read-concept operation.

## Notes

Criterion 2's status refusal is not a specification silence: the specification already answers with `{ held: false }` rather than an error (IGlossaryQuery's own read-concept contract), and which transport status that unheld answer becomes is the standard's own COR-04 concern, resolved by task/case-lifecycle-http/status-map, not a domain fact this specification would state.
