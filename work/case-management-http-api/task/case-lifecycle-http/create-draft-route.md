---
title: POST /v1/cases
summary: The HTTP route exposing the existing create-draft domain operation.
objective: POST /v1/cases exposes the existing create-draft domain operation over HTTP, following the diagnose.routes.ts/controller/DTO pattern.
criteria:
  - A valid POST /v1/cases request returns the created case's slug and its first draft version.
  - A POST /v1/cases request naming a slug that already has an open draft is refused with the status status-map assigns CaseAlreadyHasDraftError.
  - A request whose body fails the Zod DTO validation is refused before the domain operation runs.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case
  - domain/knowledge/case-version
  - rules/knowledge/a-case-has-at-most-one-draft
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired through case-lifecycle.factory.ts.

## Notes

UNDERDETERMINED, from the specification — an implementation of POST /v1/cases that refuses every request naming an already-existing slug outright, not only one whose case already has an open draft, would satisfy all three criteria as literally stated, yet the specification refuses that reading: domain/knowledge/case's own responsibility is to "originate a new draft version when a curator starts revising it" — an existing case, not only a new one — and contracts/knowledge/case-lifecycle states "revising a released case always starts the next draft." A test must exclude an implementation where POST /v1/cases treats any request naming a slug that already identifies a case as refused regardless of whether that case currently holds an open draft — create-draft must still succeed for an existing case with no open draft, originating its next draft.
