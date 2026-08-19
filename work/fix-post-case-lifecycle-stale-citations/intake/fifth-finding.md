Fifth corrective task, same initiative. /reconcile's fifth pass over the 8-file set
(siegard-reconcile/moved-nodes-post-closure-drift-5.md) found that the fourth corrective
delivery's own fix introduced a regression: it changed resolve-and-narrow-input.ts's historical
citation from rules/investigation/the-writing-input-is-narrowed to
rules/investigation/the-outcome-comes-from-the-case. This was wrong. The decision-log entry
documenting this exact historical replacement ("this rule is replaced, not relaxed — the
outcome-based branching disappears") is filed under the-writing-input-is-narrowed.md, not the
other node. The original text, before this initiative touched the file at all, already cited the
correct node.

This task reverts the citation back to rules/investigation/the-writing-input-is-narrowed.
Documentation-only: no runtime behavior changes.
