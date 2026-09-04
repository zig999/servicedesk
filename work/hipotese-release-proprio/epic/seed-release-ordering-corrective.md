---
title: Seed release ordering correction
summary: Corrects seed.ts, delivered by this initiative, to release each manifested hypothesis-revision through the declared operation before releasing the case version.
rationale: A wrong behavior observed by running the delivered system, in code this initiative already delivered — the corrective route, per this framework, gets its own epic rather than reopening a delivered one.
sources:
- intake/seed-release-ordering-corrective-scope.md
covers:
- constraints/a-case-is-read-whole
- domain/glossary/outcome
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
- rules/knowledge/a-case-version-is-written-once
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/validation-runs-at-every-read
uncovered:
- node: constraints/a-case-is-read-whole
  why: >-
    Read as a candidate and deliberately excluded: this task neither implements the case-query
    read this constraint governs, nor is its wholeness constrained by seed.ts releasing
    hypothesis-revisions apart from the case version.
- node: domain/glossary/outcome
  why: This task neither reads nor writes an outcome; its objective is release ordering alone.
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  why: >-
    This rule's ensuring-before-first-case and outcome-preservation clauses govern seed.ts's
    separate glossary-ensuring step, not the release-ordering behavior this task corrects.
- node: rules/knowledge/a-case-version-is-written-once
  why: >-
    This task's criteria do not exercise a second seed run's effect on an already-released case
    version's manifest; seed.ts's existing alreadySeeded() guard already skips seedCase()
    entirely on a second run, so this task's own fix does not reach that path.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  why: >-
    This rule's collects-no-concept refusal governs hypothesis-revision authoring, not the
    release-ordering behavior this task corrects.
- node: rules/knowledge/validation-runs-at-every-read
  why: >-
    This task's criteria read back only stored state values; the validation-at-every-read and
    replay-exception clauses govern case-query's own read, which this task does not implement.
---

## What it is

The one-behavior correction to src/seed.ts's release ordering and its raw-SQL bypass of the declared releaseHypothesisRevision operation, found by /review-change over the hipotese-release-proprio initiative and reproduced directly against a genuinely empty database.

## Notes

None.
