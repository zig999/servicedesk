---
title: Precedence-from-position — proof, and a fix to a superseded pre-existing test
summary: New tests proving that resolve-outcome and collection-plan now read each hypothesis's own declared
  position rather than array arrangement, plus an in-place fix to the one pre-existing test that pinned
  the opposite, now-superseded behavior.
implementation: sha256:4d221e046603956accca6e7a71e4c6a15c4a97268c8ef1478f9fc5e0870fa05f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-precedence-from-position-suite
tests:
- file: src/__tests__/unit/case/case-resolution.spec.ts
  name: follows each hypothesis's own declared position alone, so reversing the array arrangement changes
    nothing about which confirmed hypothesis determines
  proves: 'FIX of a pre-existing test, owned by the now-closed task/case-model/case-resolution, adjusted
    in place — a meaningful invariant survives under position-based precedence: reversing the array must
    no longer flip the answer. Proves criterion 1''s resolve-outcome half and criterion 2.'
  fails_when: resolveOutcome answers with onu-offline (position 4) instead of incidente-regional (position
    1) for either array arrangement
- file: src/__tests__/unit/case/case-resolution.spec.ts
  name: orders and dedupes the collection plan by each hypothesis's own declared position, never by the
    array's own arrangement
  proves: criterion 1's collection-plan half and criterion 7
  fails_when: collectionPlan answers in array order instead of position order, or fails to dedupe the
    repeated concept
- file: src/__tests__/unit/case/case-resolution.spec.ts
  name: answers with the earlier-position hypothesis of two confirmed ones that are neither the first
    nor the last declared position
  proves: criterion 2, reinforced beyond the two-hypothesis extremes case
  fails_when: resolveOutcome answers with the later-position hypothesis, or its answer is sensitive to
    which array slot either occupies
- file: src/__tests__/unit/case/case-resolution.spec.ts
  name: answers with regional-incident's own outcome, referral and determining role over the scenario's
    declared precedence even when the hypotheses array does not arrange them that way
  proves: criterion 3, the exact worked scenario, over an array arranged as the reverse of the declared
    precedence
  fails_when: resolved names any hypothesis other than incidente-regional as determining, or answers with
    the wrong outcome or referral
- file: src/__tests__/unit/case/case-resolution.spec.ts
  name: keeps onu-offline confirmed and marks it in no way in that same scrambled-array resolution
  proves: criterion 4
  fails_when: the verdicts record is mutated by resolveOutcome, or resolved.determining names anything
    other than incidente-regional
- file: src/__tests__/unit/case/case-resolution.spec.ts
  name: answers the fallback's outcome and referral when every hypothesis is refuted or inconclusive
  proves: criterion 5, by a pre-existing test left unmodified — the fallback path's mechanism is untouched
    by this task
  fails_when: resolveOutcome answers with any hypothesis's own resolution instead of the fallback's, when
    every verdict is refuted or inconclusive
- file: src/__tests__/unit/case/case-resolution.spec.ts
  name: names no determining hypothesis when the fallback answers
  proves: criterion 6, by the pre-existing, unmodified sibling test
  fails_when: resolved carries a determining key at all when the fallback answers
not_applicable:
- edge_case: two evaluations of one case running concurrently, or the two operations invoked against one
    case at once
  why: collectionPlan and resolveOutcome are pure, synchronous functions with no shared mutable state
    and no I/O
- edge_case: a case declaring an empty hypotheses array
  why: refused upstream at parse (rules/knowledge/a-case-has-at-least-one-hypothesis); collectionPlan
    and resolveOutcome never see it
- edge_case: two hypotheses in one case sharing one declared position
  why: refused upstream at parse, so byPrecedence's ascending sort never has a tie to break
- edge_case: position values outside a small ascending range
  why: the specification states no bound on position beyond uniqueness
- edge_case: arrival-order invariance for a single-hypothesis case
  why: with exactly one hypothesis there is only one possible array arrangement, so invariance is vacuous
    there
- edge_case: a dependency that is unavailable, slow, or answers in an unexpected shape
  why: these are pure, synchronous, in-memory functions
- edge_case: an empty collection plan
  why: every hypothesis collects at least one concept and every case has at least one hypothesis, so the
    plan is guaranteed non-empty
untested:
- The comment-only edits to src/case/case.ts and src/case/parse-case-document.ts carry no runtime behavior
  — there is nothing behavioral in them for a test to prove.
---

## What it is

Seven tests proving resolve-outcome and collection-plan now read each hypothesis's own declared
position, invariant to array arrangement — the exact worked scenario, an extremes case, and a
middle-of-the-order case, plus the two unchanged fallback-branch tests.

## Notes

One pre-existing test, owned by the now-closed case-authoring-mvp initiative, pinned the exact
array-order behavior this task's own criterion 1 supersedes. Adjusted in place rather than removed:
its own point (arrival-order invariance) survives under position-based precedence, just with a
different answer than before.
