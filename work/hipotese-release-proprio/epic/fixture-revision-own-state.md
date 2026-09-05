---
title: The canonical fixture's manifested revisions carry their own released state
summary: The shared fixture and seed data whose hypothesis revisions sit in released case versions while
  their own state was never moved past draft.
rationale: The planning grouped this apart from the obsolete tests because it is a repair to shared data
  every fixture-reading spec depends on rather than to any assertion, and because it answers to the released-version/released-revision
  pairing and to the whole-case read rather than to the immutability refusal.
sources:
- work/hipotese-release-proprio/intake/scope-suite-corrections.md
covers:
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- domain/knowledge/hypothesis-revision
- domain/knowledge/hypothesis-revision-state
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/validation-runs-at-every-read
- constraints/a-case-is-read-whole
---

## What it is

The canonical case fixture and the seed script build released case versions whose manifest entries reference revisions that never left draft in their own column.
The old join-based trigger protected those rows by coincidence; the state-only trigger does not, so their collects became removable and the case stopped reading back whole.
It restores the pairing the specification states between a released case version and the revisions its manifest names, in test data alone.

## Notes

None.
