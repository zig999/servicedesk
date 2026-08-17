---
title: IGlossaryQuery gains listConcepts
summary: A new query operation returning every concept currently registered.
objective: IGlossaryQuery gains a listConcepts operation returning every concept currently registered.
criteria:
  - Calling listConcepts returns every concept currently registered, paginated per src/types/pagination.ts.
  - Calling listConcepts against a glossary holding no concepts returns an empty page rather than an error.
depends_on:
  - task/case-query-http/pagination-types
implements:
  - contracts/glossary/glossary-query
  - domain/glossary/concept
sources:
  - intake/scope.md
---

## What it is

A new read-only IGlossaryQuery method, listConcepts.

## Notes

None.
