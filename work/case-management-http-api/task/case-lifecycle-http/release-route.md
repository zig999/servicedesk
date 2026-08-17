---
title: POST /v1/cases/{slug}/versions/{version}/release
summary: The HTTP route exposing the existing release domain operation.
objective: POST /v1/cases/{slug}/versions/{version}/release exposes the existing release domain operation over HTTP.
criteria:
  - A valid release request against a draft version whose validator rules all answer returns the version now in released state.
  - A release request against a version already released is refused with the status status-map assigns.
  - A release request against a version whose validator rules do not all answer returns every applicable refusal together, not only the first.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - rules/knowledge/a-case-version-is-written-once
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing release operation.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once states two clauses joined by "instead": a released version (and its manifest entries) is never altered again, and revising a case's content composes the next draft version instead. This task's criteria answer only the release-operation slice of the first clause; the rest of that clause (update-draft, place-hypothesis, remove-hypothesis refusing to alter a released version) and all of the second clause (create-draft originating the next version) reach no criterion here — they belong to the tasks implementing those other routes within this same epic.
