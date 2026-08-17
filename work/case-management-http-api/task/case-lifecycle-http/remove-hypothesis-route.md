---
title: DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name}
summary: The HTTP route exposing the existing remove-hypothesis domain operation.
objective: DELETE /v1/cases/{slug}/versions/{version}/manifest/{hypothesis_name} exposes the existing remove-hypothesis domain operation over HTTP.
criteria:
  - A valid request against a draft version removes the named hypothesis's manifest entry.
  - A request that would leave the manifest holding no hypothesis is refused with the status status-map assigns ManifestWouldHoldNoHypothesisError.
  - A request against a released version is refused with the status status-map assigns the a-case-version-is-written-once refusal.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
  - domain/knowledge/case-version-state
  - rules/knowledge/a-case-version-is-written-once
  - rules/knowledge/a-case-has-at-least-one-hypothesis
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing remove-hypothesis operation.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once's "revising ... composes the next draft version" clause is not exercised by remove-hypothesis; it belongs to the create-draft/revise-hypothesis route tasks of this epic.
