---
title: PATCH /v1/cases/{slug}/versions/{version}
summary: The HTTP route exposing the new update-draft domain operation.
objective: PATCH /v1/cases/{slug}/versions/{version} exposes the new update-draft domain operation over HTTP.
criteria:
  - A valid PATCH request against a draft version updates its declared attributes and returns the updated version.
  - A PATCH request against a released version is refused with the status status-map assigns the a-case-version-is-written-once refusal.
  - A PATCH request naming a slug or version that does not exist is refused with the status status-map assigns CaseNotFoundError.
depends_on:
  - task/case-lifecycle-http/update-draft-store-extension
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/resolution
  - domain/knowledge/consolidation-register
  - rules/knowledge/a-case-version-is-written-once
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO over the new updateDraft store operation.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once's manifest clause belongs to the place-hypothesis and remove-hypothesis route tasks of this epic, and its "revising ... composes the next draft version" clause belongs to the create-draft route task; neither is exercised by update-draft, which touches only a case version's own declared attributes.
Criterion 3's CaseNotFoundError refusal is not a specification silence: the standard's EDG-02 rule already governs it, and CaseNotFoundError is the typed error the underlying updateDraft store operation already raises for this exact absence.
