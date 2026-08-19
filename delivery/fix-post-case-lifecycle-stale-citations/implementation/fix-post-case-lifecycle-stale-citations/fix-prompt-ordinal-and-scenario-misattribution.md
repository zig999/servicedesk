---
title: Fix the field-names ordinal and the scenario misattribution in two doc comments
summary: Corrects judgment-stage.ts's runIsolatedCall doc comment to say field names is the third (not
  fifth) permitted entry of constraints/the-judgment-prompt-is-closed, and corrects resolve-and-narrow-input.ts's
  module header to attribute the removed confirmed/fallback split's two scenarios to rules/investigation/the-outcome-comes-from-the-case
  rather than to the-writing-input-is-narrowed.
task: sha256:c87228f57bbd9efc687a886a1e975c80ae1fbff28f9a3590901540c2eca64002
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:20acdee5acacafd214df11f468ff2cd7230209da84a65f7883a30698c000a28d
run: run/fix-post-case-lifecycle-stale-citations-fix-prompt-ordinal-and-scenario-misattribution-build
files:
- path: src/investigation/judgment-stage.ts
  effect: runIsolatedCall's doc comment now states that constraints/the-judgment-prompt-is-closed's third
    permitted entry (not fifth) is what puts each evidence item's declared field names inside the prompt
    — no code changed, only the ordinal word.
- path: src/investigation/resolve-and-narrow-input.ts
  effect: the module header's historical claim now says the confirmed/fallback split this module once
    carried, illustrated by scenarios/knowledge/no-confirmation-falls-back and scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome,
    implemented an earlier version of rules/investigation/the-outcome-comes-from-the-case, matching the
    same rule this file already cites two lines above for what resolveOutcome answers today — no code
    changed, only the cited node in prose.
criteria:
- criterion: 'judgment-stage.ts''s runIsolatedCall doc comment (currently: "constraints/the-judgment-prompt-is-closed''s
    own fifth permitted entry puts each evidence item''s declared field names inside the very prompt this
    call sends") states field names'' correct ordinal position (third, not fifth) among the node''s five
    permitted prompt entries — or drops the ordinal claim entirely and cites the node plainly.'
  met: true
  how: 'constraints/the-judgment-prompt-is-closed''s statement lists five permitted entries in this order:
    the hypothesis''s criterion, its own evidence, the field names declared in the output schema, the
    pinned case''s title, and its when_to_use — field names is the third, not the fifth. The doc comment
    now reads "constraints/the-judgment-prompt-is-closed''s own third permitted entry puts each evidence
    item''s declared field names inside the very prompt this call sends".'
- criterion: resolve-and-narrow-input.ts's module header no longer claims scenarios/knowledge/no-confirmation-falls-back
    and scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome once implemented an
    earlier version of rules/investigation/the-writing-input-is-narrowed — either the two scenarios are
    dropped from that historical claim, or the claim is corrected to name rules/investigation/the-outcome-comes-from-the-case
    instead.
  met: true
  how: The two scenarios' own content — a fallback outcome and referral when every hypothesis-revision
    was refuted or inconclusive, and precedence choosing the determining hypothesis among several confirmed
    ones — is exactly what rules/investigation/the-outcome-comes-from-the-case states resolve-outcome
    answers, not what the-writing-input-is-narrowed constrains. The module header now reads that the removed
    confirmed/fallback split, illustrated by those two scenarios, "implemented an earlier version of rules/investigation/the-outcome-comes-from-the-case
    and is removed".
- criterion: 'No runtime behavior in src/investigation/judgment-stage.ts or src/investigation/resolve-and-narrow-input.ts
    changes: the existing test suite passes unchanged.'
  met: true
  how: 'Both edits are confined to comment text: one word ("fifth" to "third") in judgment-stage.ts''s
    runIsolatedCall doc comment, and the node identifier named in a historical clause of resolve-and-narrow-input.ts''s
    module header. No statement, import, type, function signature or control-flow line in either file
    was touched.'
nodes:
- node: constraints/the-judgment-prompt-is-closed
  encoded_at:
  - src/investigation/judgment-stage.ts
  how: The node's statement enumerates the prompt's five permitted entries in order — criterion, evidence,
    field names, title, when_to_use — and runIsolatedCall's doc comment now names field names' position
    among them correctly as third; the code itself already builds the prompt content this way, unchanged
    by this task.
- node: scenarios/knowledge/no-confirmation-falls-back
  how: This corrective task does not implement the scenario's behavior — that behavior lives in case-resolution.ts's
    resolveOutcome, outside this task's two files. What this task corrects is a historical comment in
    resolve-and-narrow-input.ts that named this scenario as illustrating an earlier version of the wrong
    rule; the comment now names the rule the scenario's own given/when/then actually match.
- node: scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  how: 'Same as above: this task corrects the module header''s citation of this scenario to the rule its
    content actually illustrates (precedence choosing the determining hypothesis among confirmed evaluations),
    rather than implementing or altering the behavior it describes.'
- node: rules/investigation/the-outcome-comes-from-the-case
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: Already encoded, unchanged by this task, at resolveAndNarrow's single call to resolveOutcome(theCase,
    verdictsOf(evaluations)), whose answer is returned verbatim as ResolveAndNarrowResult.resolved. This
    task's correction makes the module header's historical clause name this rule instead of the-writing-input-is-narrowed,
    aligning the prose with the rule the file already cites two lines earlier for the same behavior.
- node: rules/investigation/the-writing-input-is-narrowed
  encoded_at:
  - src/investigation/resolve-and-narrow-input.ts
  how: Already encoded, unchanged by this task, in narrowInput/requiredEvaluationsOf/narrowedEvidenceOf
    and the NarrowedInput type, which the module header still correctly cites for the current unconditional-breadth
    behavior. This task's change stops attributing to this rule a historical implementation the two removed
    scenarios never illustrated for it.
preserved:
- resolveAndNarrow()'s and judgment-stage.ts's control flow are unchanged; every other citation in the
  surrounding comment blocks is unchanged.
---

## What it is

A corrective increment, fourth task of the same initiative: fixes two precision issues (an ordinal error, a scenario-to-rule misattribution) surfaced by /reconcile's fourth pass.

## Notes

Fourth task under work/fix-post-case-lifecycle-stale-citations. No decision-log entry: both are documentation corrections bringing prose into agreement with already-decided, already-structural facts, not new facts decided here.
