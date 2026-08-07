---
title: The resolution and the referral it carries
summary: What an investigation concluded and what somebody should do about it, declared once as one shape.
rationale: The decomposition cut this pair as its own task because the base registers it as a shape of its own and a case states it in more than one place, so writing it once is what keeps those places from disagreeing.
sources:
  - intake/scope.md
objective: A resolution is a declared shape holding an outcome and the referral that follows it, and a referral is a declared shape holding an action and a recipient.
criteria:
  - A referral value carries the action somebody takes.
  - A referral value carries the role that takes it.
  - A referral missing its action does not parse.
  - A referral missing its recipient does not parse.
  - A resolution value carries the outcome an investigation concluded.
  - A resolution value carries the referral that follows that outcome.
  - A resolution missing its outcome does not parse.
  - A resolution missing its referral does not parse.
nodes:
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
---
## What it is

The two smallest shapes a case states about what follows.
A referral is the action and the role that takes it.
A resolution is the outcome and the referral taken together.

## Notes

The vocabularies these two name are checked against the glossary by a task in the validation epic, not here.
UNDERDETERMINED, from the binding — criteria one, two, five and six turn on what a by-identity reference carries, and neither bound node holds that fact; what those references identify sits in `definition/glossary/action`, `definition/glossary/recipient` and `definition/glossary/outcome`, and the closure they answer to in `rule/knowledge/case-terms-exist-in-the-glossary` and `rule/glossary/a-lookup-matches-a-published-name-exactly`.
UNDERDETERMINED passes — a referral whose action and recipient, and a resolution whose outcome, are free-form strings never checked against any published vocabulary, which meets every criterion while the referral's own rule that both come from the glossary refuses it.
Decision, beyond the covers — stand: `definition/glossary/action`, `definition/glossary/recipient`, `definition/glossary/outcome`, `rule/knowledge/case-terms-exist-in-the-glossary`, `rule/glossary/a-lookup-matches-a-published-name-exactly` and `rule/glossary/recipient-is-a-role` are claimed by `epic/published-language-ports` and `epic/case-validation`, whose tasks answer that closure, so growing this epic's claim would duplicate scope two epics already declare.
UNDERDETERMINED, from the binding — criteria three, four, seven and eight say only that a malformed value does not parse, and the base decides the shape of that refusal in `rule/knowledge/a-validation-answers-with-every-refusal`, `definition/knowledge/refusal` and `rule/knowledge/two-positions-are-two-refusals`.
UNDERDETERMINED passes — a parser that aborts on the first missing required part, so a referral missing both parts yields one failure and a case with several malformed resolutions yields one, which meets all four criteria while the validation rule refuses it.
Decision, beyond the covers — stand: `rule/knowledge/a-validation-answers-with-every-refusal`, `definition/knowledge/refusal` and `rule/knowledge/two-positions-are-two-refusals` are `epic/case-validation`'s claim and are bound by `task/case-validation/refusal-and-accumulation`, so how a refusal is shaped and collected is that task's and not this one's.
REMAINDER, from the binding — `definition/knowledge/referral` states that a referral may not be seen before the investigation has a record, and no criterion of this task reaches that clause.
REMAINDER belongs — the investigation act, governed by `definition/investigation/assessment` and `rule/investigation/the-response-follows-the-record`, which this plan does not build.
Decision, beyond the covers — stand: `definition/investigation/assessment` and `rule/investigation/the-response-follows-the-record` belong to the investigation context, which no epic of this plan claims.
REMAINDER, from the binding — `definition/knowledge/resolution` states that every hypothesis carries one and so does the fallback for when nothing confirms, and neither clause reaches a criterion here.
REMAINDER belongs — `task/case-shape/hypothesis-shape`, which binds `definition/knowledge/hypothesis`, and `task/case-shape/draft-case-shape`, which binds `definition/knowledge/draft-case`.
REMAINDER, from the binding — `definition/knowledge/resolution` rules that a resolution is declared by the case and never produced during an investigation, and nothing this task delivers can falsify that.
REMAINDER belongs — `rule/investigation/the-outcome-comes-from-the-case` and `rule/knowledge/the-fallback-follows-what-the-collection-returned`, which decide that a resolution is selected from what the case declared rather than composed.
Decision, beyond the covers — stand: `rule/investigation/the-outcome-comes-from-the-case` belongs to the investigation context, which no epic of this plan claims.
From the binding — six candidates were read and left unbound, and this epic reconciles each of them through a sibling task.
