---
title: Manifest-collects-survive-release fixture release-write duplication correction
summary: Corrects manifest-collects-survive-release.spec.ts, a file this project already delivered, so its own release-transition fixture calls the declared lifecycle operation instead of duplicating its write as raw SQL.
rationale: A wrong behavior found by review-change over the hipotese-release-proprio initiative, in code this project already delivered — the corrective route, per this framework, gets its own epic rather than reopening a delivered one.
sources:
- intake/manifest-collects-survive-release-duplication-corrective-scope.md
covers:
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
uncovered:
- node: domain/knowledge/hypothesis-revision-state
  why: This node only supplies the released/draft vocabulary the fixture write borrows; no criterion demonstrates anything about the state enumeration itself.
---
## What it is

The one-behavior correction to manifest-collects-survive-release.spec.ts's own fixture-side release-transition write, found by /review-change's standard-conformance pass over the hipotese-release-proprio initiative's captured delivery.

## Notes

None.
