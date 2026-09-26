---
title: Overwrite-revision draft guard
summary: The case store's overwriteHypothesisRevision refuses to write once the case holds no draft version, matching insertHypothesisRevision's own guard.
covers:
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- domain/knowledge/hypothesis-revision
sources:
- intake/scope.md
---

## What it is

The corrective increment's own epic, claiming exactly what the binder found
`overwriteHypothesisRevision`'s missing draft guard answers to: the draft-only revise policy, the
overwrite-in-place invariant, and the hypothesis-revision aggregate those two govern.

## Notes
