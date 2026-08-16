---
title: Case-version aggregate types and structural validation for the draft/released split
summary: case.ts's types and parse-case-document.ts's structural checks updated so a hypothesis's stable identity, its revisioned content and its manifest position are three distinct facts, and the version itself carries state and released_at.
rationale: The scope states the shape a diagnosis consumer reads must not change (§3.2) but leaves the concrete type split to whoever implements; I cut this as one task covering both the types and their structural validator, per the reasoning already stated in this task's epic.
sources:
- work/case-lifecycle/intake/scope.md
objective: The case-version aggregate's own types and its structural, at-every-read validation express hypothesis identity separated from revisioned content, a manifest of positioned revision references, and the version's own draft/released state, while the shape a diagnosis consumer reads stays exactly what it reads today.
criteria:
- A hypothesis's stable identity (its name) and its revisioned content (revision, criterion, collects, resolution) are declared as two distinct types, never one flat record.
- A manifest entry's type declares a position and a reference to exactly one hypothesis-revision, never that revision's own content inline.
- The case-version type declares state, released_at present only where state is released, and its manifest as many manifest entries.
- Reading a case version whose manifest holds no entry is refused, naming that the case declares no hypothesis, whether the version is draft or released.
- Reading a case version where any adopted hypothesis-revision collects no concept is refused, naming it.
- Reading a case version where any adopted hypothesis-revision declares an empty criterion is refused, naming it.
- The hypotheses/criterion/collects/resolution shape run-diagnosis.ts and diagnose.controller.ts already consume is unchanged by this task.
implements:
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-hypothesis-declares-a-criterion
- rules/knowledge/a-case-has-at-least-one-hypothesis
- rules/knowledge/validation-runs-at-every-read
---

## What it is

The two files that together state what a case-version aggregate is and refuse one that is not structurally whole.
It needs no database to be demonstrated — a fixture built in memory is enough.

## Notes

REMAINDER, from the specification — rules/knowledge/validation-runs-at-every-read's statement carries two clauses: validation runs at every read (draft or released, with no separate "not ready" field), and replay reads the pinned version without revalidation. This task's criteria answer only the first, through the manifest and revision-collects/criterion checks. The replay exception names a call-site behavior (readCase not revalidating a pinned replay) that neither case.ts's types nor parse-case-document.ts's structural checks implement or gate; it belongs to whichever task composes reading and replay over the case-version aggregate. Belongs to: work/case-lifecycle/epic/case-lifecycle-operations (already an existing, unchanged behavior of replayCase in case-query.service.ts — no new task is expected to be needed for it, per the report).
