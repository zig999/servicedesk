---
title: ICaseStore gains listCases
summary: A new store operation returning every case's identity.
objective: ICaseStore gains a listCases operation returning every case currently held.
criteria:
  - Calling listCases with no filter returns every case currently held, paginated per src/types/pagination.ts.
  - Calling listCases against an empty store returns an empty page rather than an error.
depends_on:
  - task/case-query-http/pagination-types
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case
sources:
  - intake/scope.md
---

## What it is

A new read-only ICaseStore method, listCases, with no new refusal rule.

## Notes

None.
