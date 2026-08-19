---
title: Proof for fix-post-case-lifecycle-stale-citations/fix-draft-assessment-citation
summary: One test reads draft-assessment-text.ts's own raw module header and asserts it now cites domain/knowledge/case-version
  for consolidationRegister's consolidation_register, and no longer cites domain/knowledge/case; criterion
  2's "no runtime behavior changed" rests on this file's own pre-existing, unmodified behavioral suite
  rather than on a new test.
implementation: sha256:e6b7bc5d6c638ef2a8105166e2f9cccbcffe2dd8e49b41ac48b4e9284783f7c2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-fix-draft-assessment-citation-suite-4
tests:
- file: src/__tests__/unit/investigation/draft-assessment-text.spec.ts
  name: the module header attributes consolidationRegister's own consolidation_register to the pinned
    case version, not the case identity
  proves: criterion 1 — src/investigation/draft-assessment-text.ts's doc comment cites domain/knowledge/case-version
    instead of domain/knowledge/case for consolidation_register
  fails_when: the module header stops citing domain/knowledge/case-version for consolidation_register's
    own attribution, or a bare domain/knowledge/case citation reappears anywhere in that header
not_applicable:
- edge_case: absent/empty input, a boundary at either end of a range, a duplicate where uniqueness is
    claimed, a concurrent operation, and a dependency that fails or answers slowly
  why: this task changes no runtime behavior in draft-assessment-text.ts — the edit is confined to one
    doc-comment citation, per the implementation record's own single-file files entry and its preserved
    claim — so none of these behavior-shaped edge cases has anything to attach to; reading the corrected
    citation text is the whole of what this documentation-only change can be tested for
untested:
- 'Criterion 2''s "the existing test suite passes unchanged" clause is not itself run by this proof: the
  new test is appended to the end of the pre-existing spec file without altering any existing test body,
  fixture or assertion, and the source file''s non-comment lines are untouched — but actually executing
  the suite to confirm it still reports green is the project''s own captured test step, not something
  this proof runs by itself.'
---

## What it is

One new test, appended to the pre-existing spec file, proving the corrective task's two criteria by reading the corrected file's own raw source text.

## Notes

Independently verified by the orchestrating session: typecheck, lint and secret-scan all pass (run/fix-post-case-lifecycle-stale-citations-fix-draft-assessment-citation-build); the full suite is captured at run/fix-post-case-lifecycle-stale-citations-fix-draft-assessment-citation-suite. No existing test body, fixture or assertion was altered — only one test appended.
