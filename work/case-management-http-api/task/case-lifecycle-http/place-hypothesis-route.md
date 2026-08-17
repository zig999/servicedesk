---
title: PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
summary: The HTTP route exposing the existing place-hypothesis domain operation.
objective: PUT /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name} exposes the existing place-hypothesis domain operation over HTTP.
criteria:
  - A valid request against a draft version places the named hypothesis's stated revision at the stated manifest position.
  - A request against a released version is refused with the status status-map assigns the a-case-version-is-written-once refusal.
  - A request naming a manifest position already occupied is refused with the status status-map assigns ManifestPositionOccupiedError.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-hypothesis-position-is-unique-within-its-case
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing place-hypothesis operation.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once's "revising ... composes the next draft version" clause reaches no criterion here; it belongs to the task exposing create-draft.
REMAINDER, from the specification — rules/knowledge/a-case-has-at-least-one-hypothesis's manifest-completeness clause is naturally checked at release, where every validator rule answers together; it belongs to the task exposing release.
REMAINDER, from the specification — rules/knowledge/a-case-has-at-most-one-draft constrains when a draft may be originated, not placing a hypothesis onto an already-open draft; it belongs to the task exposing create-draft.
