---
title: GET /v1/cases/{slug}/versions/{version}
summary: The HTTP route exposing the existing read-case domain operation.
objective: GET /v1/cases/{slug}/versions/{version} exposes the existing read-case domain operation over HTTP.
criteria:
  - A valid request returns the named case version assembled and validated whole — its own attributes, its manifest and every manifest entry's own hypothesis-revision.
  - A request naming a slug or version that does not exist is refused with the status status-map assigns CaseNotFoundError.
  - A request against a case version that cannot be assembled whole returns nothing rather than a partially assembled result.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/resolution
  - constraints/a-case-is-read-whole
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing read-case domain operation.

## Notes

None.
