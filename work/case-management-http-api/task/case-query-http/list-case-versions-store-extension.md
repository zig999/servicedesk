---
title: ICaseStore gains listCaseVersions
summary: A new store operation returning every version one named case holds.
objective: ICaseStore gains a listCaseVersions operation returning every version a named case holds.
criteria:
  - Calling listCaseVersions with an existing slug returns every version that case currently holds, paginated per src/types/pagination.ts.
  - Calling listCaseVersions with a slug that does not exist is refused with CaseNotFoundError.
depends_on:
  - task/case-query-http/pagination-types
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case
  - domain/knowledge/case-version
sources:
  - intake/scope.md
---

## What it is

A new read-only ICaseStore method, listCaseVersions, refusing an unknown slug the same way assembleVersion already does.

## Notes

None.
