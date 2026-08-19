---
title: Proof for fix-post-case-lifecycle-stale-citations/fix-prompt-ordinal-and-scenario-misattribution
summary: Two tests read judgment-stage.ts's and resolve-and-narrow-input.ts's own raw source text — one
  asserting runIsolatedCall's doc comment now cites the judgment-prompt-is-closed node's third (not fifth)
  permitted entry for field names, the other asserting the module header now attributes the removed confirmed/fallback
  split's two scenarios to an earlier version of rules/investigation/the-outcome-comes-from-the-case rather
  than the-writing-input-is-narrowed; criterion 3's "no runtime behavior changed" rests on this task's
  own unmodified behavioral tests rather than on a new one.
implementation: sha256:7ffc36306cfd652eb6333c96060b431b09284b8aa34d4871a3cb28da2e8aad12
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-fix-prompt-ordinal-and-scenario-misattribution-suite
tests:
- file: src/__tests__/unit/investigation/judgment-stage.spec.ts
  name: runIsolatedCall()'s doc comment states field names as constraints/the-judgment-prompt-is-closed's
    own third permitted prompt entry, not its fifth
  proves: criterion 1 — judgment-stage.ts's runIsolatedCall doc comment states field names' correct ordinal
    position (third, not fifth) among the node's five permitted prompt entries
  fails_when: the comment reverts to attributing field names to "its own fifth permitted entry", or the
    corrected phrase stops appearing in runIsolatedCall's own doc comment
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: the module header attributes the removed confirmed/fallback split, illustrated by scenarios/knowledge/no-confirmation-falls-back
    and scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome, to an earlier version
    of rules/investigation/the-outcome-comes-from-the-case, not the-writing-input-is-narrowed
  proves: criterion 2 — resolve-and-narrow-input.ts's module header no longer claims the two named scenarios
    once implemented an earlier version of rules/investigation/the-writing-input-is-narrowed, and instead
    names rules/investigation/the-outcome-comes-from-the-case
  fails_when: the header reverts to reading that the confirmed/fallback split implemented an earlier version
    of rules/investigation/the-writing-input-is-narrowed, or the corrected attribution stops appearing,
    or either scenario's own citation disappears from that historical clause
not_applicable:
- edge_case: absent/empty input, a boundary at either end of a range, a duplicate where uniqueness is
    claimed, a concurrent operation, and a dependency that fails or answers slowly
  why: this task changes no runtime behavior in judgment-stage.ts or resolve-and-narrow-input.ts — both
    edits are confined to prose inside a doc comment and a module header — so none of these behavior-shaped
    edge cases has anything to attach to; reading the corrected comment text in each file is the whole
    of what this documentation-only change can be tested for
untested:
- 'Criterion 3''s "the existing test suite passes unchanged" clause is not itself run by this proof: both
  new tests are appended to the end of their respective pre-existing spec files without altering any existing
  test body, fixture or assertion, and neither file''s non-comment lines are touched — but actually executing
  the suite to confirm it still reports green is the project''s own captured test step, not something
  this proof runs by itself.'
---

## What it is

Two new tests, appended to the pre-existing spec files, proving the corrective task's three criteria by reading the corrected files' own raw source text.

## Notes

Independently verified by the orchestrating session: typecheck, lint and secret-scan all pass (run/fix-post-case-lifecycle-stale-citations-fix-prompt-ordinal-and-scenario-misattribution-build); the full suite is captured at run/fix-post-case-lifecycle-stale-citations-fix-prompt-ordinal-and-scenario-misattribution-suite. No existing test body, fixture or assertion was altered — only two tests appended.
