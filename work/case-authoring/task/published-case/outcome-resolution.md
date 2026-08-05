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
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/knowledge/resolution
  - definition/knowledge/referral
  - definition/investigation/evaluation
  - definition/investigation/assessment
  - definition/glossary/outcome
  - definition/glossary/action
  - definition/glossary/recipient
  - rule/knowledge/hypotheses-are-ordered-by-precedence
  - rule/investigation/the-outcome-comes-from-the-case
  - rule/investigation/one-evaluation-per-hypothesis
  - process/investigation/diagnose
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
unresolved:
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This task reads a case already published and identified; nothing on its path derives or writes a version, and no criterion reaches the case's identity."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "Producing the answer never computes or verifies the hash \u2014 pinning the case by content happens before this station in the flow, and no criterion reaches it."
  - gap: definition/investigation/assessment#attributes.text.audience
    why: "No criterion reaches the assessment's text; this task carries the case's resolution and the determining hypothesis, and what the text may expose is settled where the text is written. The required text itself is the blocking note below, not this waiver."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "The remaining outcomes are contributed by each case's confirmable hypotheses; this task carries whichever outcome the case declared and compares outcomes by name identity, never selecting one from the enumeration."
  - gap: definition/glossary/action#attributes.name.values
    why: "Criterion 8 compares referrals by their action and recipient identity; the task carries the action the case declared and never picks one from the vocabulary."
  - gap: definition/glossary/recipient#attributes.name.values
    why: "Same as the action \u2014 the recipient is carried from the case's declared referral and compared by name."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "Criterion 2 uses the order the case declares, whatever it is; which cause actually dominates is curation's fact, unverifiable by any validator per the node itself."
---

## What it is
The third of the three behaviours the scope named, turning the verdicts on a case's hypotheses into what the investigation concluded and what somebody should do.
The precedence reading, in which the confirmed hypothesis the case lists earliest is the one that determines the resolution.
The fallback the case itself declares for the situation in which nothing confirms.
The leaving alone of every evaluation, so two hypotheses confirming stays visible after the answer is produced.

## Notes

The two provenance criteria tie what the assessment carries to the one resolution the case resolved, which the construct itself cannot state because it never reads the case.
The last two criteria close the path on which an implementation could drop or overwrite the later confirmed evaluation and still satisfy everything else this task states.
BLOCKING, from the binding — the assessment this task produces requires a text, and the assessment's rules on the narrowed writing input govern it; both sit on this task's own path and no criterion reaches them, so either the writing is a separate task this one depends on or a criterion is missing.
BLOCKING, from the binding — criterion 5 speaks of the resolution the case declares for that situation as one resolution, while the base requires both non-conclusion outcomes to exist against a single fallback slot; the criterion cannot distinguish the two kinds of non-conclusion until the cited gap is settled.
From the binding — the candidates governing collection and judging rather than answering are left unbound, and the epic must declare them uncovered or another task binds them.
From the binding — the completeness of the evaluation set this task reads is established outside its binding, since the rule requiring it constrains a construct not among the candidates.
