---
title: Revert resolve-and-narrow-input.ts's historical citation to the-writing-input-is-narrowed
summary: Reverted a prior corrective task's own miscorrection in the module header of resolve-and-narrow-input.ts,
  restoring the citation for the removed confirmed/fallback split's historical implementation to rules/investigation/the-writing-input-is-narrowed,
  matching that node's own decision-log entry.
task: sha256:4a377203680f38cdd10f157d9f91445fa8918000bcb991a13743f5467e32b652
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-revert-outcome-comes-from-case-misattribution-build
files:
- path: src/investigation/resolve-and-narrow-input.ts
  effect: 'Module header comment edit only: the historical clause describing the removed confirmed/fallback
    split now cites rules/investigation/the-writing-input-is-narrowed instead of rules/investigation/the-outcome-comes-from-the-case
    as the rule that split''s earlier implementation answered to. No other text, comment, import, type,
    or function in the file was changed.'
criteria:
- criterion: 'resolve-and-narrow-input.ts''s module header (currently: "...the confirmed/fallback split
    this module once carried (task/assessment-drafting/resolve-and-narrow-input, scenarios/knowledge/no-confirmation-falls-back,
    scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome) implemented an earlier
    version of rules/investigation/the-outcome-comes-from-the-case and is removed.") cites rules/investigation/the-writing-input-is-narrowed
    instead of rules/investigation/the-outcome-comes-from-the-case.'
  met: true
  how: 'The single clause was edited exactly as specified; verified by reading the file''s full header
    after the edit and confirming only that one phrase changed (see the git diff: one line, "the-outcome-comes-from-the-case"
    to "the-writing-input-is-narrowed").'
- criterion: 'No runtime behavior in src/investigation/resolve-and-narrow-input.ts changes: the existing
    test suite passes unchanged.'
  met: true
  how: The edit touches only a comment line inside the module header; no import, export, type, function
    body, or executable statement was altered.
nodes:
- node: rules/investigation/the-writing-input-is-narrowed
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: The module header's historical clause about the removed confirmed/fallback split now correctly
    cites this node as what that removed split implemented an earlier version of, matching the node's
    own decision-log entry ("this rule is replaced, not relaxed — the outcome-based branching disappears").
- node: rules/investigation/the-outcome-comes-from-the-case
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: The historical clause about the removed confirmed/fallback split no longer cites this node, since
    that rule was never what the removed split implemented. The node's own, distinct and correct citation
    earlier in the same header (for the resolveOutcome call this module makes) was left untouched, as
    it is unrelated to the reverted clause.
preserved:
- resolveAndNarrow()'s control flow and every other citation in the surrounding comment blocks are unchanged;
  the earlier, correct citation of rules/investigation/the-outcome-comes-from-the-case (for the resolveOutcome
  call itself) is untouched.
---

## What it is

A corrective increment, fifth task of the same initiative: reverts a miscorrection the fourth task's own fix introduced, per /reconcile's fifth pass, confirmed against the decision log.

## Notes

Fifth task under work/fix-post-case-lifecycle-stale-citations. No decision-log entry: this is a documentation correction bringing prose back into agreement with an already-decided, already-disclosed fact (the decision-log entry filed under rules/investigation/the-writing-input-is-narrowed.md), not a new fact decided here.
