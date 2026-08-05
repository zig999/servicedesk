---
title: Published case
summary: The published case as it stands in source, together with the three answers it owns — what its hypotheses collect, which hypotheses require an evaluation, and which resolution follows from the evaluations.
rationale: The scope named the three behaviours and the validating rules as two halves, and this epic takes the half that answers; the amendment grew its claim to the five nodes that hold the semantics of those answers, and the claim is drawn to include the constructs the answers produce — the evaluation, its citations and the assessment — because a behaviour whose product no claimed node describes cannot be shown to answer anything; the uniqueness of a hypothesis name is declared untouched here, because it is an invariant publication holds and no task of this epic decides it.
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-revinculacao.md
  - intake/escopo-revinculacao-adendo.md
covers:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/investigation/evaluation
  - definition/investigation/citation
  - definition/investigation/assessment
  - definition/integration/capability
  - definition/glossary/concept
  - definition/glossary/subject-type
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - definition/knowledge/draft-case
  - lifecycle/knowledge/case-publication
  - process/investigation/diagnose
  - rule/knowledge/hypotheses-are-ordered-by-precedence
  - rule/knowledge/hypothesis-name-is-unique-in-its-case
  - rule/knowledge/the-body-does-not-change-what-is-collected
  - rule/investigation/the-outcome-comes-from-the-case
  - rule/investigation/one-evaluation-per-hypothesis
  - rule/investigation/a-decided-evaluation-cites-evidence
  - rule/investigation/an-inconclusive-evaluation-declares-its-reason
uncovered:
  - node: definition/knowledge/draft-case
    why: The scope excluded the publication cycle from this invocation, so nothing here authors or holds a case before it is published, and the three behaviours read a case that is already published.
  - node: lifecycle/knowledge/case-publication
    why: The scope excluded the publication cycle from this invocation, so nothing here transitions a case into or out of publication.
  - node: rule/knowledge/hypothesis-name-is-unique-in-its-case
    why: The rule refuses publication of a case whose hypotheses share a name, so a published case never bears one and no task of this epic can demonstrate the invariant without asserting a published case the base refuses to publish; the refusal is held by the validating epic's check over the hypotheses declared for a case.
---

## What it is

The half of the scope that answers rather than refuses, drawn around the published case and the three behaviours the scope named for it.
The published case's own constructs — the case, its identity and publication metadata, its hypotheses in declared precedence order, the resolutions and referrals it declares — as they stand in the target source.
The three answers the published case owns, each computed from what the case itself declares.
The constructs those answers read and produce — the evaluation of one hypothesis, the citations a decided evaluation rests on, and the assessment that carries a resolution.

## Notes

The amendment added `process/investigation/diagnose`, `definition/investigation/citation`, `rule/investigation/a-decided-evaluation-cites-evidence`, `definition/integration/capability` and `definition/investigation/assessment` to what this plan may claim, and all five are claimed here because all five sit on the path of one of the three answers.
`definition/integration/capability` is claimed by this epic and by the validating epic, which is shared scope declared rather than a conflict, and each epic reconciles its own claim.
The epic claims the five glossary definitions because a case's resolutions, referrals, collected facts and declared subject type name terms from them.
The epic claims `draft-case` and `case-publication` only to record them as deliberately untouched, because the phrase "published case" abuts a publication cycle the scope removed for a reason it stated.
Every construct this epic builds is a valid one, because a case is published whole or not at all and the published value is what the three answers read.
`definition/investigation/investigation`, `definition/investigation/evidence` and `interface/investigation/investigation-completed` remain outside this claim, because the amendment named the five nodes it named and nothing here runs an investigation or holds the evidence a citation points at.
No task here selects a language, a toolchain or a test harness, since the scope names none and the survey found an empty target, and each task's criteria are therefore stated as behaviour observable from outside whatever is written.
