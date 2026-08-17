---
title: GET /v1/cases
summary: The HTTP route exposing the new listCases store operation.
objective: GET /v1/cases exposes the new listCases store operation over HTTP.
criteria:
  - A valid request returns a paginated page of every case's identity.
  - The response body matches the pagination envelope src/types/pagination.ts defines.
depends_on:
  - task/case-query-http/list-cases-store-extension
  - task/case-query-http/pagination-types
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listCases store operation.

## Notes

None.
