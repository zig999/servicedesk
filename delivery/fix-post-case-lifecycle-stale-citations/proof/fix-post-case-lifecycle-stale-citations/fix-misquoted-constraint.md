---
title: Proof for fix-post-case-lifecycle-stale-citations/fix-misquoted-constraint
summary: One test reads judgment-stage.ts's own raw source, extracts the JSDoc block immediately preceding
  judgeOneHypothesis, and asserts it now states the denied-slot-costs-nothing consequence in its own voice
  with a plain citation of constraints/hypotheses-are-judged-in-isolated-parallel-calls, and no longer
  carries the node's-own-quoted-text pattern for that sentence; criterion 2's "no runtime behavior changed"
  rests on this file's own pre-existing, unmodified behavioral suite rather than on a new test.
implementation: sha256:44941d683de1a8978ba2f2d01cb169cdacd899814fbf9a0b8a70de5d1a7fcc6e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-fix-misquoted-constraint-suite
tests:
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: judgeOneHypothesis's doc comment states the denied-slot-costs-nothing consequence in its own voice,
    citing constraints/hypotheses-are-judged-in-isolated-parallel-calls plainly rather than quoting it
    for text the node does not hold
  proves: criterion 1 — judgment-stage.ts's doc comment on judgeOneHypothesis no longer quotes constraints/hypotheses-are-judged-in-isolated-parallel-calls
    for a sentence the node does not hold
  fails_when: the comment reverts to attributing "a hypothesis denied a slot makes no call, so it costs
    nothing" to constraints/hypotheses-are-judged-in-isolated-parallel-calls' own quoted text, or the
    corrected sentence's wording stops appearing in judgeOneHypothesis's own doc comment
not_applicable:
- edge_case: absent/empty input, a boundary at either end of a range, a duplicate where uniqueness is
    claimed, a concurrent operation, and a dependency that fails or answers slowly
  why: this task changes no runtime behavior in judgment-stage.ts — the edit is confined to one doc-comment
    sentence and its citation, per the implementation record's own single-file files entry and its preserved
    claim — so none of these behavior-shaped edge cases has anything to attach to; reading the corrected
    comment text is the whole of what this documentation-only change can be tested for
untested:
- 'Criterion 2''s "the existing test suite passes unchanged" clause is not itself run by this proof: the
  new test is appended to the end of the pre-existing spec file without altering any existing test body,
  fixture or assertion, and judgment-stage.ts''s non-comment lines are untouched — but actually executing
  the suite to confirm it still reports green is the project''s own captured test step, not something
  this proof runs by itself.'
---

## What it is

One new test, appended to the pre-existing spec file, proving the corrective task's two criteria by reading the corrected file's own raw source text.

## Notes

Independently verified by the orchestrating session: typecheck, lint and secret-scan all pass (run/fix-post-case-lifecycle-stale-citations-fix-misquoted-constraint-build); the full suite is captured at run/fix-post-case-lifecycle-stale-citations-fix-misquoted-constraint-suite. No existing test body, fixture or assertion was altered — only one test appended.
