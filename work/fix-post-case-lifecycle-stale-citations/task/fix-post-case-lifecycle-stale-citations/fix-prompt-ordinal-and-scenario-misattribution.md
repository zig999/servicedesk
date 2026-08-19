---
title: Fix two more doc-comment precision issues in judgment-stage.ts and resolve-and-narrow-input.ts
summary: Corrects an ordinal-position error citing constraints/the-judgment-prompt-is-closed, and a historical comment misattributing two scenarios to the wrong rule as what they once implemented.
objective: judgment-stage.ts's runIsolatedCall doc comment correctly states field names' ordinal position among constraints/the-judgment-prompt-is-closed's permitted prompt content, and resolve-and-narrow-input.ts's module header no longer names scenarios/knowledge/no-confirmation-falls-back or scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome as illustrating an earlier version of rules/investigation/the-writing-input-is-narrowed, since both scenarios' own content governs rules/investigation/the-outcome-comes-from-the-case instead.
criteria:
  - "judgment-stage.ts's runIsolatedCall doc comment (currently: \"constraints/the-judgment-prompt-is-closed's own fifth permitted entry puts each evidence item's declared field names inside the very prompt this call sends\") states field names' correct ordinal position (third, not fifth) among the node's five permitted prompt entries — or drops the ordinal claim entirely and cites the node plainly."
  - "resolve-and-narrow-input.ts's module header no longer claims scenarios/knowledge/no-confirmation-falls-back and scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome once implemented an earlier version of rules/investigation/the-writing-input-is-narrowed — either the two scenarios are dropped from that historical claim, or the claim is corrected to name rules/investigation/the-outcome-comes-from-the-case instead."
  - "No runtime behavior in src/investigation/judgment-stage.ts or src/investigation/resolve-and-narrow-input.ts changes: the existing test suite passes unchanged."
implements:
  - constraints/the-judgment-prompt-is-closed
  - scenarios/knowledge/no-confirmation-falls-back
  - scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  - rules/investigation/the-outcome-comes-from-the-case
  - rules/investigation/the-writing-input-is-narrowed
sources:
  - intake/fourth-finding.md
---

## What it is

A corrective increment, fourth task of the same initiative: /reconcile's fourth pass over the
prior three corrective deliveries surfaced two new precision issues unrelated to the citation
identity confusion those fixed.

## Notes

None.
