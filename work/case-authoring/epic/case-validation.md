---
title: Validating a case
summary: What one refusal carries, how a validation answers with every one of them, and the checks over a case's own content and its terms.
rationale: The decomposition gathered the checks into one epic and cut one task per rule the base registers, because each of those rules is one falsifiable outcome that can be shown met without finishing another check. The claim grew to hold the constructs every check walks — the case under edit, its hypotheses, the glossary entries a term is looked up in, and the rule deciding what counts as a match — because a check may not reach outside its epic and none of these checks can be stated without them.
sources:
  - intake/scope.md
covers:
  - definition/glossary/action
  - definition/glossary/concept
  - definition/glossary/outcome
  - definition/glossary/recipient
  - definition/glossary/subject-type
  - definition/knowledge/draft-case
  - definition/knowledge/hypothesis
  - definition/knowledge/referral
  - definition/knowledge/refusal
  - definition/knowledge/resolution
  - rule/glossary/a-lookup-matches-a-published-name-exactly
  - rule/knowledge/a-validation-answers-with-every-refusal
  - rule/knowledge/case-has-at-least-one-hypothesis
  - rule/knowledge/case-terms-exist-in-the-glossary
  - rule/knowledge/concept-accepts-the-declared-subject-type
  - rule/knowledge/every-collected-concept-declares-a-ttl
  - rule/knowledge/hypothesis-collects-at-least-one-concept
  - rule/knowledge/hypothesis-name-is-unique-in-its-case
  - rule/knowledge/one-falsifiable-claim-per-criterion
  - rule/knowledge/two-positions-are-two-refusals
uncovered:
  - node: rule/knowledge/one-falsifiable-claim-per-criterion
    why: It is a claim about the prose of a criterion, and this plan builds no check that reads that prose; the epic claims it so the omission is declared rather than silent.
---
## What it is

The refusal a validation answers with, and one check per rule the base registers over a case a curator wrote.
The checks that read only the case sit beside the checks that read the glossary through the port declared elsewhere.
The claim holds the case under edit and the hypothesis because every check walks both, and holds the five glossary definitions because the checks against the published language look terms up in them.
It holds the rule that a lookup matches a published name exactly, because without it a check comparing names loosely would satisfy every criterion written here.

## Notes

The check on the contract with the integration context is not here: the base registers it as verified when publishing, so it is cut under the publication epic.
`definition/knowledge/draft-case`, `definition/knowledge/hypothesis`, `definition/knowledge/referral` and `definition/knowledge/resolution` sit in this claim and in `epic/case-shape`'s, and the two reconcile independently.
Every check in this epic produces refusals through the one refusal shape, and none of them stops another from running.
