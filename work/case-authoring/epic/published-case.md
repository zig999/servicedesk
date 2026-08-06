---
title: Published case
summary: The published case as it stands in source, together with the three answers it owns — what its hypotheses collect, which hypotheses require an evaluation, and which resolution follows from the evaluations.
rationale: The scope named the three behaviours and the validating rules as two halves, and this epic takes the half that answers; the amendment grew its claim to the five nodes holding the semantics of those answers, and the claim reaches the constructs the answers produce — the evaluation, its citations and the assessment — because a behaviour whose product no claimed node describes cannot be shown to answer anything; the claim grows here to the fields a concept declares, to the evidence a fallback selection reads, to the invariant selecting between the two fallbacks and to the invariant fixing what the content hash covers, because the base moved the citation check's authority into the glossary, made the choice between the two fallbacks turn on what the collection returned, and decided that prose is inside the hash; `definition/integration/capability` stays claimed and is declared untouched, because the base now states its schema is not what a citation is checked against, so no answer of this epic reads it.
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-revinculacao.md
  - intake/escopo-revinculacao-adendo.md
  - intake/escopo-recorte-seis-decisoes.md
  - intake/escopo-revinculacao-cinco-decisoes.md
covers:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/investigation/evaluation
  - definition/investigation/citation
  - definition/investigation/assessment
  - definition/investigation/evidence
  - definition/integration/capability
  - definition/glossary/concept
  - definition/glossary/observation-field
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
  - rule/knowledge/the-content-hash-covers-the-whole-file
  - rule/knowledge/the-fallback-follows-what-the-collection-returned
  - rule/investigation/the-outcome-comes-from-the-case
  - rule/investigation/one-evaluation-per-hypothesis
  - rule/investigation/a-decided-evaluation-cites-evidence
  - rule/investigation/an-inconclusive-evaluation-declares-its-reason
  - rule/investigation/one-evidence-per-collected-concept
  - rule/investigation/an-unattempted-concept-records-a-timeout
uncovered:
  - node: definition/knowledge/draft-case
    why: The scope excluded the publication cycle from this invocation, so nothing here authors or holds a case before it is published, and the three behaviours read a case that is already published.
  - node: lifecycle/knowledge/case-publication
    why: The scope excluded the publication cycle from this invocation, so nothing here transitions a case into or out of publication.
  - node: rule/knowledge/hypothesis-name-is-unique-in-its-case
    why: The rule refuses publication of a case whose hypotheses share a name, so a published case never bears one and no task of this epic can demonstrate the invariant without asserting a published case the base refuses to publish; the refusal is held by the validating epic's check over the hypotheses declared for a case.
  - node: definition/integration/capability
    why: The amendment claimed it because a citation was thought to be checked against the output schema of the capability that produced the evidence, and the base has since decided the cited field is checked against the fields the concept declares and that the capability's schema is not what a citation is checked against; nothing this epic answers reads a capability any more, and the read-only contract over a collected concept is the validating epic's.
---

## What it is

The half of the scope that answers rather than refuses, drawn around the published case and the three behaviours the scope named for it.
The published case's own constructs — the case, its identity and publication metadata, its hypotheses in declared precedence order, the resolutions it declares for its hypotheses and the two it declares for none confirming — as they stand in the target source.
The three answers the published case owns, each computed from what the case itself declares.
The constructs those answers read and produce — the evaluation of one hypothesis, the citations a decided evaluation rests on, the results the collection returned, and the assessment that carries a resolution.

## Notes

The amendment added `process/investigation/diagnose`, `definition/investigation/citation`, `rule/investigation/a-decided-evaluation-cites-evidence`, `definition/integration/capability` and `definition/investigation/assessment` to what this plan may claim, and four of the five remain claimed and reached by a task.
`definition/glossary/observation-field` is claimed because the field a citation names is now checked against the fields the cited concept declares, and that is where those fields live.
`definition/investigation/evidence` is claimed because the choice between the two fallbacks reads the result each evidence carries, and no other answer of this epic reads one.
`rule/knowledge/the-content-hash-covers-the-whole-file` is claimed because the collection answer states that two cases with identical structured hypotheses and differing prose answer alike, and whether those are two published cases at all is what that invariant decides.
The epic claims the five glossary definitions because a case's resolutions, referrals, collected facts and declared subject type name terms from them.
The epic claims `draft-case` and `case-publication` only to record them as deliberately untouched, because the phrase published case abuts a publication cycle the scope removed for a reason it stated.
Every construct this epic builds is a valid one, because a case is published whole or not at all and the published value is what the three answers read.
`definition/investigation/investigation` and `interface/investigation/investigation-completed` remain outside this claim, because nothing here runs an investigation or writes one.
No task here selects a language, a toolchain or a test harness, since the scope names none and the survey found an empty target, and each task's criteria are therefore stated as behaviour observable from outside whatever is written.
The claim grows by the two evidence-totality rules, because the fallback selection reads the results the collection returned and the base now states that reading is total — one evidence per collected concept, a never-attempted one recording a timeout.
