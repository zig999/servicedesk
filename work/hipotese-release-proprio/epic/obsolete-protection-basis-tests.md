---
title: Tests still certifying the revoked protection basis
summary: The persistence tests that prove a hypothesis-revision's immutability from a released case version's
  reference to it, rather than from the revision's own state.
rationale: The planning grouped these apart from the fixture repair because they change for a different
  reason — a test here changes when what the schema refuses changes, while a fixture row changes when
  what the canonical case holds changes — and because their whole outcome is what the tree asserts, with
  no shared data behind it.
sources:
- work/hipotese-release-proprio/intake/scope-suite-corrections.md
covers:
- rules/knowledge/a-released-hypothesis-revision-is-never-altered
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- constraints/the-schema-replays-from-its-scripts
---

## What it is

The part of the suite that still proves the old inversion: a revision protected because some released case version's manifest happened to reference it.
Migration 0021 moved the schema's own condition onto the revision's state column, so these assertions certify a basis the specification revoked.
It holds the schema-level specs and the repository-level spec separately, because each answers to a different layer of the same refusal.

## Notes

None.
