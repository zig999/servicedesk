---
title: Diagnose-server factory fixture release ordering correction
summary: Corrects diagnose-server.factory.spec.ts, a file this project already delivered, to release each manifested hypothesis-revision through the declared operation before releasing the case version.
rationale: A wrong behavior observed by running the delivered system twice, in code this project already delivered — the corrective route, per this framework, gets its own epic rather than reopening a delivered one.
sources:
- intake/diagnose-server-factory-fixture-release-ordering-corrective-scope.md
covers:
- domain/investigation/durations
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/investigation/a-measured-duration-below-one-millisecond-is-zero
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
uncovered:
- node: domain/investigation/durations
  why: >-
    Read as a candidate mechanically via trace.py --encodes, since the file already carried a
    binding to it from a prior task; this task's own objective and criteria concern release
    ordering alone and neither read nor assert anything about measured durations.
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  why: >-
    Same as above — bound to this file by a prior, unrelated task; this task's fixture-seeding
    correction does not reach the duration-measurement behavior this rule governs.
---

## What it is

The one-behavior correction to diagnose-server.factory.spec.ts's own fixture-seeding release ordering, found by two failure-diagnostician passes over the hipotese-release-proprio initiative's own captured suite runs and reproduced directly.

## Notes

None.
