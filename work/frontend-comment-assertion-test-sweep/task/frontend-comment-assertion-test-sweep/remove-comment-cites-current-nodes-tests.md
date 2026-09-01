---
title: Remove the two frontend tests asserting a source comment's literal prose
summary: Deletes cases-list-screen-comment-cites-the-current-nodes.spec.ts and case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts
  in full, whose assertions read removed production comments and now fail against an empty string.
sources:
- intake/scope.md
objective: The frontend suite no longer holds any test whose assertion reads a production source file's
  comment prose in cases-list-screen.tsx or case-simulation-detail-panel.tsx -- while every behavioral
  test elsewhere, and all production behavior, is unchanged.
rationale: This task implements no specification node. Every candidate the specification held that a
  removed test's assertion cited inside a production comment states runtime behavior that already-delivered,
  untouched work proves; deleting a test that checked a comment's wording changes no behavior any node
  governs, so none of them is implemented, extended or contradicted by this task's own act.
criteria:
- frontend/app/src/routes/cases-list-screen-comment-cites-the-current-nodes.spec.ts is deleted entirely
  (all 5 of its tests, which assert the prose of a JSDoc comment that used to precede `type CaseSummary
  = ` in cases-list-screen.tsx and cited domain/knowledge/case-summary and rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
  -- that JSDoc no longer exists in the source).
- frontend/app/src/routes/case-simulation-detail-panel-comment-cites-the-current-nodes.spec.ts is deleted
  entirely (all of its tests reading the prose between the literal markers "Criterion 6" and "Criterion
  7" that used to sit inside a comment in case-simulation-detail-panel.tsx and cited domain/investigation/evaluation
  and domain/investigation/investigation -- that comment block no longer exists in the source).
- No production source file changes, and no other test file changes.
- Running the full frontend suite (`npm test`) after the removals passes, with no remaining test weakened,
  skipped, or rewritten to tolerate comment content the removed tests used to check.
---

## What it is

A corrective increment: these two tests were written to enforce that a production comment
correctly cites and explains the specification nodes it touches -- a documentation convention the
project's own rules have since forbidden outright ("Source carries no comments"). This removes the
enforcement, not any behavior: every fact these files' own removed comments used to state stays
proved, untouched, by the already-delivered work that renders it (the cases-list screen and the
case-simulation detail panel), never by a test reading a comment's prose.

## Notes

Advisory, from the specification -- this task implements none of its epic's four covered nodes.
domain/knowledge/case-summary declares a value object of current_state, version_count and
last_updated derived from a case's own case-versions; rules/knowledge/a-case-summary-is-derived-
from-its-existing-versions states how each of those three is computed and what an empty case
yields; domain/investigation/evaluation declares one hypothesis's verdict, citations, reason and
call record; domain/investigation/investigation declares the immutable diagnosis aggregate and its
attributes. Deleting two test files that asserted only a comment's literal prose creates, alters or
demonstrates no behavior any of these four nodes governs -- a comment is not a home for any of
these facts. The epic declares all four uncovered for that reason.
REMAINDER, from the specification -- every clause of rules/knowledge/a-case-summary-is-derived-
from-its-existing-versions's own statement of the zero-version case (current_state being the state
of the highest-numbered version, version_count being the number of versions currently held,
last_updated being that same version's authored_at, and a case holding no version having
version_count zero and neither current_state nor last_updated) reaches no criterion of this task;
the criteria only delete two test files and hold the suite green. Belongs to the already-delivered
work that derives and renders a case summary (the cases-list screen and its backing derivation),
not this corrective increment -- the rule reached this epic's covers only because a removed
comment's prose cited its identity.
Advisory, from the specification -- with `implements` absent, the plan-node contract's task branch
requires `rationale` on this task node; the reason is the finding above.
