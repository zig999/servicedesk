---
title: Validating a case
summary: What one refusal carries, where its position points, how a validation answers with every one of them, and the checks over a case's own content and its terms.
rationale: "The decomposition gathered the checks into one epic and cut one task per rule the base registers, because each of those rules is one falsifiable outcome that can be shown met without finishing another check. The claim grew to hold the constructs every check walks — the case under edit, its hypotheses, the glossary entries a term is looked up in, and the rule deciding what counts as a match. It grew a second time to hold what commit a50f278 added about a refusal: that its position is one path indexing a hypothesis by name, that its text is declared by the rule that refused, and that what the curator reads is Portuguese. It claims the one further check that commit registered, rule/knowledge/the-slug-matches-the-file-name, and builds no task for it, because the base declares no text for its refusal and records that this check is not among the ones whose texts were decided for this plan."
sources:
  - intake/scope.md
  - intake/scope-2026-08-07.md
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
  - rule/knowledge/a-position-indexes-a-hypothesis-by-name
  - rule/knowledge/a-validation-answers-with-every-refusal
  - rule/knowledge/case-has-at-least-one-hypothesis
  - rule/knowledge/case-terms-exist-in-the-glossary
  - rule/knowledge/concept-accepts-the-declared-subject-type
  - rule/knowledge/every-collected-concept-declares-a-ttl
  - rule/knowledge/hypothesis-collects-at-least-one-concept
  - rule/knowledge/hypothesis-name-is-unique-in-its-case
  - rule/knowledge/one-falsifiable-claim-per-criterion
  - rule/knowledge/the-refusal-text-comes-from-the-rule
  - rule/knowledge/the-slug-matches-the-file-name
  - rule/knowledge/two-positions-are-two-refusals
  - rule/knowledge/what-the-curator-reads-is-written-in-portuguese
uncovered:
  - node: rule/knowledge/one-falsifiable-claim-per-criterion
    why: It is a claim about the prose of a criterion, and this plan builds no check that reads that prose; the epic claims it so the omission is declared rather than silent.
  - node: rule/knowledge/the-slug-matches-the-file-name
    why: The rule declares no text for the refusal it would produce, and its open gap over that text records that the decision fixed the refusal texts for the checks this plan builds and that this check is not among them. A refusal must carry a text, and the text a refusal carries is the one its rule declares, so a check built here would have to write a curator-facing sentence no node holds — which is why the check waits on the base rather than on this plan. The epic claims the rule so the omission is declared rather than silent; the fact is produced through /analyse-domain, and a later plan covers it.
---
## What it is

The refusal a validation answers with, and one check per rule the base registers over a case a curator wrote.
The checks that read only the case sit beside the checks that read the glossary through the port declared elsewhere.
The claim holds the case under edit and the hypothesis because every check walks both, and holds the five glossary definitions because the checks against the published language look terms up in them.
It holds the rule that a lookup matches a published name exactly, because without it a check comparing names loosely would satisfy every criterion written here.
It holds the three rules that decide what a refusal carries, because every check in this epic produces refusals and none of them may invent what one says or where it points.

## Notes

The claim grew by four nodes, all of them added by commit a50f278.
`rule/knowledge/a-position-indexes-a-hypothesis-by-name` and `rule/knowledge/the-refusal-text-comes-from-the-rule` grew it because `definition/knowledge/refusal` now carries one required position and one required text whose content the rule that refused declares, and the checks this epic holds carried both as questions the base did not answer.
`rule/knowledge/what-the-curator-reads-is-written-in-portuguese` grew it for the same reason, because it is what fixes the language of a text every check's refusal carries.
`rule/knowledge/the-slug-matches-the-file-name` grew it because it is a check over a case the base did not hold when this plan was cut, and leaving it out would drop a check the base registers rather than declare it dropped.
That rule carries an open gap over the text its refusal declares, and the gap is what the task binding it records as unresolved; it is not a reason to leave the rule uncovered, because an uncovered rule is a check the plan silently does not build.
`definition/knowledge/draft-case`, `definition/knowledge/hypothesis`, `definition/knowledge/referral` and `definition/knowledge/resolution` sit in this claim and in `epic/case-shape`'s, and `rule/knowledge/what-the-curator-reads-is-written-in-portuguese` in this one and in two others; each epic reconciles independently.
The check on the contract with the integration context is not here: the base registers it as verified when publishing, so it is cut under the publication epic.
Every check in this epic produces refusals through the one refusal shape, and none of them stops another from running.
