---
title: GET /v1/glossary/concepts
summary: The HTTP route exposing the new listConcepts query operation.
objective: GET /v1/glossary/concepts exposes the new listConcepts query operation over HTTP.
criteria:
  - A valid request returns a paginated page of every concept currently registered.
  - The response body matches the pagination envelope src/types/pagination.ts defines.
depends_on:
  - task/glossary-query-http/list-concepts-query-extension
  - task/case-query-http/pagination-types
  - task/case-lifecycle-http/status-map
implements:
  - contracts/glossary/glossary-query
  - domain/glossary/concept
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listConcepts query operation.

## Notes

The pagination shape this task's criteria name is not a specification silence: it is the standard's own API-01 through API-04 concern, resolved by task/case-query-http/pagination-types, not a domain fact this specification would state.
