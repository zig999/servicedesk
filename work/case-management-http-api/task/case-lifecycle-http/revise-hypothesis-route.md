---
title: POST /v1/cases/{slug}/hypotheses
summary: The HTTP route exposing the existing revise-hypothesis domain operation.
objective: POST /v1/cases/{slug}/hypotheses exposes the existing revise-hypothesis domain operation over HTTP.
criteria:
  - A valid request naming a new or existing hypothesis persists a new hypothesis-revision with its criterion, collects and resolution.
  - A request whose body fails the Zod DTO validation is refused before the domain operation runs.
  - A request naming a case slug that does not exist is refused with the status status-map assigns CaseNotFoundError.
depends_on:
  - task/case-lifecycle-http/status-map
implements:
  - contracts/knowledge/case-lifecycle
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/resolution
sources:
  - intake/scope.md
---

## What it is

A thin Fastify plugin, controller and Zod DTO wired to the existing revise-hypothesis operation.

## Notes

REMAINDER, from the specification — rules/knowledge/a-case-version-is-written-once's two clauses (a released version's own immutability, and revising composing the next draft) reach no criterion here: revise-hypothesis originates a hypothesis-revision independent of any case version's manifest or release state. They belong to the tasks implementing place-hypothesis/remove-hypothesis and create-draft respectively.
Criterion 3's CaseNotFoundError refusal is not a specification silence: the standard's EDG-02 rule already governs it, and CaseNotFoundError is the typed error the existing revise-hypothesis domain operation's callers already raise for this exact absence.
