---
title: Shared pagination type
summary: A src/types/pagination.ts module defining the request and response shape every listing endpoint follows.
rationale: The scope names src/types/pagination.ts as required before any of the seven listing endpoints can respond in the shape the standard's API-01 through API-04 require (§1.3); it implements no specification node — it is a technical shape, not a domain fact — so it is cut as one ungoverned task the listing tasks across every epic depend on. The binder confirmed no candidate node in this epic's covers states anything about a pagination shape.
objective: A shared pagination request and response type exists in src/types/pagination.ts, following the standard's API-01 through API-04.
criteria:
  - The module exports a pagination request type carrying offset and limit.
  - The module exports a pagination response envelope type carrying a page of items alongside a total count.
sources:
  - intake/scope.md
---

## What it is

A new src/types/pagination.ts, greenfield since no src/types/ directory exists today.
It carries no business rule; it is the one shape every listing route and its store extension share.

## Notes

Every listing task across all four epics depends on this task.
ADVISORY, from the binder — none of the candidate nodes (the case-query contract, the case/case-version/hypothesis/hypothesis-revision/manifest-entry/resolution domain models, or the a-case-is-read-whole constraint) state anything about a pagination shape; the four listing operations name that listings exist but say nothing about how one is paged, so pagination is entirely an artifact of the project's own standard, not a domain fact this specification governs.
