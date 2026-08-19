---
title: Proof for fix-post-case-lifecycle-stale-citations/revert-outcome-comes-from-case-misattribution
summary: Corrects, in place, a pre-existing test in resolve-and-narrow-input.spec.ts that a sibling task's
  own proof had written to assert the miscorrected (pre-revert) state of the module header's historical
  citation; the corrected assertions now match the reverted text. Criterion 2's "no runtime behavior changed"
  rests on this file's own remaining, unmodified behavioral tests rather than on a new one.
implementation: sha256:862ece60490695b79604b58d0b2cd459b2fcd9f5312f208682fe334e049b77ca
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-revert-outcome-comes-from-case-misattribution-suite
tests:
- file: src/__tests__/unit/investigation/resolve-and-narrow-input.spec.ts
  name: the module header attributes the removed confirmed/fallback split, illustrated by scenarios/knowledge/no-confirmation-falls-back
    and scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome, to an earlier version
    of rules/investigation/the-writing-input-is-narrowed, not the-outcome-comes-from-the-case
  proves: criterion 1 — resolve-and-narrow-input.ts's module header cites rules/investigation/the-writing-input-is-narrowed
    instead of rules/investigation/the-outcome-comes-from-the-case for the removed confirmed/fallback
    split's historical implementation. This is a pre-existing test corrected in place (its prior form,
    written by the sibling fix-prompt-ordinal-and-scenario-misattribution task, asserted the opposite,
    now-superseded citation) rather than a new test appended beside a contradictory one, and its correction
    is also what keeps criterion 2 true, since the uncorrected assertion would fail against the reverted
    header.
  fails_when: the header reverts to reading that the confirmed/fallback split implemented an earlier version
    of rules/investigation/the-outcome-comes-from-the-case, or the corrected attribution stops appearing,
    or either named scenario's own citation disappears from that clause
not_applicable:
- edge_case: absent/empty input, a boundary at either end of a range, a duplicate where uniqueness is
    claimed, a concurrent operation, and a dependency that fails or answers slowly
  why: this task changes no runtime behavior in resolve-and-narrow-input.ts — the edit is confined to
    one doc-comment citation inside the module header — so none of these behavior-shaped edge cases has
    anything to attach to; reading the corrected citation text is the whole of what this documentation-only
    change can be tested for
untested:
- 'Criterion 2''s "the existing test suite passes unchanged" clause is not itself run by this proof: the
  one existing test named above was corrected in place to match the reverted header, and every other test
  in resolve-and-narrow-input.spec.ts is untouched — but actually executing the suite to confirm it reports
  green is the project''s own captured test step, not something this proof runs by itself.'
---

## What it is

Corrects one pre-existing test in place, matching the fifth corrective task's revert, so the suite reflects the corrected citation rather than the sibling task's own miscorrected one.

## Notes

Independently verified by the orchestrating session: typecheck, lint and secret-scan all pass (run/fix-post-case-lifecycle-stale-citations-revert-outcome-comes-from-case-misattribution-build); the full suite is captured at run/fix-post-case-lifecycle-stale-citations-revert-outcome-comes-from-case-misattribution-suite. No test body was added — one pre-existing assertion, written by the sibling fix-prompt-ordinal-and-scenario-misattribution task's own proof, was corrected in place to match this task's revert.
