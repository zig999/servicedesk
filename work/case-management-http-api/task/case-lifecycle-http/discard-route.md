---
title: DELETE /v1/cases/{slug}/versions/{version}
summary: The HTTP route exposing the existing discard domain operation.
objective: DELETE /v1/cases/{slug}/versions/{version} exposes the existing discard domain operation over HTTP.
criteria:
  - A valid DELETE request against a draft version removes it and answers with no content.
  - A DELETE request against a released version is refused with the status status-map assigns the a-case-version-is-written-once refusal.
  - A DELETE request naming a slug or version that does not exist is refused with the status status-map assigns CaseNotFoundError.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case-version
  - domain/knowledge/case
  - domain/knowledge/case-version-state
  - rules/knowledge/a-case-version-is-written-once
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing discard operation.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once's own second clause, "revising a case's content composes the next draft version instead," describes create-draft's own origination of a new draft from a released case, not discard; no criterion of this DELETE task addresses it. It belongs to the create-draft task within this same epic.
