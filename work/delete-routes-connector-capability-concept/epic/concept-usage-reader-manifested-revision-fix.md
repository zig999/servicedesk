---
title: concept-usage-reader detects a concept a manifested hypothesis-revision still collects
summary: A corrective increment fixing resolveConceptUsage's fourth branch, which today reports a concept
  as unnamed by a hypothesis-revision's own collects whenever a case version manifests that revision —
  the opposite of what the governing rule's decided text requires.
rationale: Corrective increment per /review-change's conformance pass over this initiative's own delivery.
  The wrong behavior lives in code this initiative delivered and answers to no criterion any of its tasks
  holds, because the rule's manifested-vs-unmanifested scope was decided (knowledge/decision-log.md, 2026-09-18
  UNDERDETERMINED/decided pair) after task/cross-context-usage-reads/concept-usage-reader was written against
  the narrower, unmanifested-only reading its own criteria still state. A new epic, never an existing one —
  growing the delivered reader epic's claim for this one correction would re-open every task it already holds.
sources:
- intake/2026-09-22-concept-usage-reader-manifested-revision-gap.md
covers:
- domain/integration/capability
- domain/investigation/citation
- domain/investigation/evidence
- domain/knowledge/hypothesis-revision
- constraints/the-domain-depends-on-no-infrastructure
- rules/glossary/a-registered-concept-is-never-removed
uncovered:
- node: domain/integration/capability
  why: Untouched by this correction — the fourth branch this task fixes reads only the case store's
    manifest state, never a capability.
- node: domain/investigation/citation
  why: Untouched — this correction touches only the hypothesis-revision-collects branch, not the citation
    branch.
- node: domain/investigation/evidence
  why: Untouched — this correction touches only the hypothesis-revision-collects branch, not the evidence
    branch.
---

## What it is
One task, correcting the one branch the review found wrong: resolveConceptUsage's fourth condition now
reports a concept named by any hypothesis-revision's own collects, manifested or not, matching
rules/glossary/a-registered-concept-is-never-removed's own decided text.

## Notes
The four other nodes this file's own `trace.py --encodes` names (domain/integration/capability,
domain/investigation/citation, domain/investigation/evidence, constraints/the-domain-depends-on-no-infrastructure)
are carried into `covers` because they are what the trace already binds to
src/factories/concept-usage-reader.factory.ts as a whole file, per the corrective-increment route's own
mechanical seeding step; only constraints/the-domain-depends-on-no-infrastructure and
rules/glossary/a-registered-concept-is-never-removed are this correction's own concern, and the other three
are declared uncovered rather than pursued.
rules/glossary/a-registered-concept-is-never-removed is not itself in this file's own trace binding (the
task/concept-removal/remove-concept-operation implementation record holds it against other files, per that
task's own Notes — "growing this reader task's claim to include it would duplicate a fact already governed
there"), but the wrong behavior is observably in this file's own fourth branch, and this correction's task
is written against it directly; the epic's covers is widened by this one entry beyond the mechanical seed
so the binder below may consider it.
