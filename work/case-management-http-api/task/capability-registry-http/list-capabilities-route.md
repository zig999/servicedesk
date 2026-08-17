---
title: GET /v1/capabilities
summary: The HTTP route exposing the new listCapabilities query operation.
objective: GET /v1/capabilities exposes the new listCapabilities query operation over HTTP.
criteria:
  - A valid request returns a paginated page of every capability currently registered.
  - The response body matches the pagination envelope src/types/pagination.ts defines.
depends_on:
  - task/capability-registry-http/list-capabilities-query-extension
  - task/case-query-http/pagination-types
  - task/case-lifecycle-http/status-map
implements:
  - contracts/integration/capability-registry
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listCapabilities query operation.

## Notes

None.
