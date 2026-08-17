---
title: ICaseStore gains listHypotheses
summary: A new store operation returning every hypothesis one named case holds.
objective: ICaseStore gains a listHypotheses operation returning every hypothesis a named case holds.
criteria:
  - Calling listHypotheses with an existing slug returns every hypothesis that case currently holds, paginated per src/types/pagination.ts.
  - Calling listHypotheses with a slug that does not exist is refused with CaseNotFoundError.
depends_on:
  - task/case-query-http/pagination-types
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - constraints/a-case-is-read-whole
sources:
  - intake/scope.md
---

## What it is

A new read-only ICaseStore method, listHypotheses, refusing an unknown slug the same way assembleVersion already does.

## Notes

REMAINDER, from the specification — constraints/a-case-is-read-whole's own clause binding a case version read for diagnosis to whole-or-nothing assembly is not exercised by this task; it belongs to the task implementing case-query's read-case operation.
UNDERDETERMINED, from the specification — a reading that scopes the result to only the hypotheses referenced by the case's current (latest draft or released) version manifest would satisfy the criteria as literally worded, but the specification refuses that reading: contracts/knowledge/case-query describes list-hypotheses as returning "the hypotheses of one named case" (case-scoped, not version-scoped), and domain/knowledge/hypothesis states a hypothesis is named uniquely within its case across every version the case ever holds — past, current or future — so its case membership does not depend on any one version's manifest. A test must exclude an implementation that filters by the current version's manifest rather than by case identity alone.
