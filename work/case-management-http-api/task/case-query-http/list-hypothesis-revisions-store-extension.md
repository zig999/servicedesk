---
title: ICaseStore gains listHypothesisRevisions
summary: A new store operation returning every revision one named hypothesis holds.
objective: ICaseStore gains a listHypothesisRevisions operation returning every revision one named hypothesis holds.
criteria:
  - Calling listHypothesisRevisions with an existing slug and hypothesis name returns every revision that hypothesis currently holds, paginated per src/types/pagination.ts.
  - Calling listHypothesisRevisions with a slug or hypothesis name that does not exist is refused with CaseNotFoundError.
depends_on:
  - task/case-query-http/pagination-types
implements:
  - contracts/knowledge/case-query
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - constraints/a-case-is-read-whole
sources:
  - intake/scope.md
---

## What it is

A new read-only ICaseStore method, listHypothesisRevisions, refusing an unknown slug or hypothesis name.

## Notes

Criterion 2's CaseNotFoundError refusal is not a specification silence: the standard's EDG-02 rule already governs a resource that does not exist being refused through a typed error, and CaseNotFoundError is the existing typed error other store operations (assembleVersion) already raise for this exact absence.
