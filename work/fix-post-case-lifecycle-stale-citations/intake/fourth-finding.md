Fourth corrective task, same initiative. /reconcile's fourth pass over the 8-file set
(siegard-reconcile/moved-nodes-post-closure-drift-4.md) confirmed all three prior corrective
deliveries hold, and found two new, unrelated precision issues:

1. src/investigation/judgment-stage.ts's runIsolatedCall doc comment states field names are
   constraints/the-judgment-prompt-is-closed's "fifth permitted entry," but the node's own
   statement lists field names as the third of five permitted entries (title is fourth,
   when_to_use fifth).

2. src/investigation/resolve-and-narrow-input.ts's module header states that two scenarios
   (scenarios/knowledge/no-confirmation-falls-back and
   scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome) once implemented
   an earlier version of rules/investigation/the-writing-input-is-narrowed. Both scenarios'
   own content governs rules/investigation/the-outcome-comes-from-the-case instead (fallback
   outcome and precedence-based determining hypothesis), which is already correctly cited two
   lines later in the same file.

Documentation-only: no runtime behavior changes.
