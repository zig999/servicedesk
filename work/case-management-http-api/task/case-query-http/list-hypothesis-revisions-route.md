---
title: GET /v1/cases/{slug}/hypotheses/{name}/revisions
summary: The HTTP route exposing the new listHypothesisRevisions store operation.
objective: GET /v1/cases/{slug}/hypotheses/{name}/revisions exposes the new listHypothesisRevisions store operation over HTTP.
criteria:
  - A valid request against an existing slug and hypothesis name returns a paginated page of every revision that hypothesis holds.
  - A request naming a slug or hypothesis name that does not exist is refused with the status status-map assigns CaseNotFoundError.
depends_on:
  - task/case-query-http/list-hypothesis-revisions-store-extension
  - task/case-query-http/pagination-types
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - constraints/a-case-is-read-whole
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new listHypothesisRevisions store operation.

## Notes

REMAINDER, from the specification — constraints/a-case-is-read-whole's whole-case-for-diagnosis clause is not exercised by this listing; it belongs to the read-case route task of this epic.
Neither the pagination shape nor the CaseNotFoundError refusal this task's criteria name is a specification silence: pagination is the standard's own API-01 through API-04 concern (see task/case-query-http/pagination-types), and CaseNotFoundError is already governed by the standard's EDG-02 rule and already the typed error the underlying store operation raises for this exact absence.
