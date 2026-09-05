---
title: Diagnose-persistence-deadline-e2e fixture release-write duplication correction
summary: Corrects diagnose-persistence-deadline-e2e.spec.ts, a file this project already delivered, so its own release-transition fixture calls the declared lifecycle operation instead of duplicating its write as raw SQL.
rationale: A wrong behavior found by review-change over the hipotese-release-proprio initiative, in code this project already delivered — the corrective route, per this framework, gets its own epic rather than reopening a delivered one.
sources:
- intake/diagnose-persistence-deadline-fixture-corrective-scope.md
covers:
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
---
## What it is

The one-behavior correction to diagnose-persistence-deadline-e2e.spec.ts's own fixture-side release-transition write, found by /review-change's standard-conformance pass over the hipotese-release-proprio initiative's captured delivery.

## Notes

None.
