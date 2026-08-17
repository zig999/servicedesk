---
title: GET /v1/cases/{slug}/versions
summary: The HTTP route exposing the new listCaseVersions store operation.
objective: GET /v1/cases/{slug}/versions exposes the new listCaseVersions store operation over HTTP.
criteria:
  - A valid request against an existing slug returns a paginated page of every version that case holds.
  - A request naming a slug that does not exist is refused with the status status-map assigns CaseNotFoundError.
depends_on:
  - task/case-query-http/list-case-versions-store-extension
  - task/case-query-http/pagination-types
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case
  - domain/knowledge/case-version
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listCaseVersions store operation.

## Notes

Criterion 2's CaseNotFoundError refusal is not a specification silence: the standard's EDG-02 rule already governs it, and CaseNotFoundError is the typed error the underlying listCaseVersions store operation already raises for this exact absence.
