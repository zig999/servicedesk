---
title: "The resolution a published case answers with"
summary: "The assessment a published case answers with, carrying the resolution the case resolved by the precedence it declared, naming the hypothesis that determined it, and leaving every evaluation standing."
rationale: "The provenance of the outcome and the referral is carried here rather than by the construct, because this is the task that reads the case and can tie what the assessment carries to what the case resolved; the criteria about the evaluations surviving the answer are here because this is the only task that reads more than one verdict at once."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A published case answers, from the evaluations of its hypotheses, with one assessment carrying the resolution the case resolved for the hypothesis it names as determining, leaving every evaluation as it stood."
criteria:
  - "A case in which exactly one hypothesis confirms answers with an assessment naming that hypothesis as determining."
  - "A case in which two hypotheses confirm answers with an assessment naming as determining the confirmed hypothesis the case lists earliest in its declared order."
  - "A case in which exactly one hypothesis confirms answers with an assessment carrying the resolution the case declared for that hypothesis."
  - "A case in which two hypotheses confirm answers with an assessment carrying the resolution the case declared for the hypothesis it names as determining."
  - "A case in which no hypothesis confirms answers with an assessment carrying the resolution the case declares for that situation."
  - "A case in which no hypothesis confirms answers with an assessment naming no determining hypothesis."
  - "The outcome the assessment carries is the outcome of the one resolution the case resolved for this answer, and no other outcome the case holds appears in it."
  - "The referral the assessment carries is the referral of that same resolution, and no other referral the case holds appears in it."
  - "In a case in which two hypotheses confirm, the evaluation of the later-listed confirmed hypothesis still reads back its confirming verdict once the answer is produced."
  - "Producing the answer marks no hypothesis of the case as superseded."
depends_on:
  - task/published-case/case-structure
  - task/published-case/evaluation-record
  - task/published-case/assessment-record
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/investigation/evaluation
  - definition/investigation/assessment
  - definition/glossary/outcome
  - process/investigation/diagnose
  - rule/knowledge/hypotheses-are-ordered-by-precedence
  - rule/investigation/the-outcome-comes-from-the-case
  - rule/investigation/one-evaluation-per-hypothesis
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
unresolved:
  - question: "The base requires both inconclusive-no-data and inconclusive-hypotheses-exhausted to exist in the outcome vocabulary, while a case declares exactly one fallback resolution. No node says which of the two a case's fallback carries, nor whether the situation reached selects between them, so criteria 5 and 7 cannot both be demonstrated until the base decides this."
waived:
  - gap: definition/investigation/assessment#attributes.text.audience
    why: "The gap asks what an assessment's text may expose to the end customer; this task decides which resolution the assessment carries and which hypothesis it names as determining, and no criterion concerns the text or its reader."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "The gap is the outcomes each confirmable hypothesis will contribute; the answer carries the outcome of the resolution the case already declared, unchanged and without inspecting the vocabulary. The two non-conclusion outcomes are a separate matter and are unresolved above."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "The gap is which real cause dominates which, a fact only the specialists affirm; criterion 2 reads whatever order the case declares and is demonstrable without any illustrative order being settled."
---

## What it is

The third of the three behaviours the scope named, turning the verdicts on a case's hypotheses into what the investigation concluded and what somebody should do.
The precedence reading, in which the confirmed hypothesis the case lists earliest is the one that determines the resolution.
The fallback the case itself declares for the situation in which nothing confirms.
The leaving alone of every evaluation, so two hypotheses confirming stays visible after the answer is produced.

## Notes

The two provenance criteria tie what the assessment carries to the one resolution the case resolved, which the construct itself cannot state because it never reads the case.
The last two criteria close the path on which an implementation could drop or overwrite the later confirmed evaluation and still satisfy everything else this task states.
BLOCKING, from the binding — the assessment requires a text and states what the writing receives in each branch, and no criterion here reaches the text at all, so either a criterion covers what text this answer supplies or the seam with the writing task is stated explicitly.
From the binding — the clause binding whether the declared order is the right order is curation-time human review and reaches no criterion here.
From the binding — every criterion assumes a complete set of evaluations as input, and none exercises what the answer does when that set is incomplete.
