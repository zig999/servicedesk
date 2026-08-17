---
title: Case query HTTP surface
summary: The four new listing extensions to ICaseStore, the shared pagination type they and other listings need, and the five HTTP routes that read a case, its versions, its hypotheses and their revisions.
rationale: Groups the five case-query operations the scope's table (§0) names together, plus the aggregates and value objects a whole-case read and the four listings return — case, case-version, hypothesis, hypothesis-revision, manifest-entry and resolution — which overlap with case-lifecycle-http's claim on the write side, an overlap the contract allows as shared scope. constraints/a-case-is-read-whole is claimed here because it governs read-case specifically, the one operation in this epic it names. pagination-types is placed here, ahead of glossary-query-http and capability-registry-http, because this epic holds four of the seven listing endpoints the standard's pagination shape gates.
covers:
  - contracts/knowledge/case-query
  - domain/knowledge/case
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
  - domain/knowledge/resolution
  - constraints/a-case-is-read-whole
sources:
  - intake/scope.md
---

## What it is

The shared pagination request/response type the standard's API-01 through API-04 require of every listing endpoint.
Four new read-only ICaseStore operations: listCases, listCaseVersions, listHypotheses, listHypothesisRevisions.
Five HTTP routes: read-case (already a domain operation), list-cases, list-case-versions, list-hypotheses, list-hypothesis-revisions.

## Notes

None.
