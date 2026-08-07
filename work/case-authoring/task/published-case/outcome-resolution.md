---
title: "The resolution a published case answers with"
summary: "The assessment a published case answers with, carrying the resolution the case resolved — by the precedence it declared, or by the fallback its selection yielded where nothing confirmed — naming the hypothesis that determined it where one did, and leaving every evaluation standing."
rationale: "The provenance of the outcome and the referral is carried here rather than by the construct, because this is the task that reads the case and can tie what the assessment carries to what the case resolved; the criteria about the evaluations surviving the answer are here because this is the only task that reads more than one verdict at once; the none-confirms criteria take the fallback the selection yielded as given rather than restating what the collection returned, because the choice between the two declared fallbacks is the selection task's one outcome and restating it here would give the same rule two homes; they are one criterion per yielded fallback because an answer hard-wired to a single fallback would pass either criterion alone and fails the pair."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
  - intake/escopo-recorte-seis-decisoes.md
  - intake/escopo-retomada-revinculacao.md
objective: "A published case answers, from the evaluations of its hypotheses, with one assessment carrying the resolution the case resolved — the one declared for the hypothesis it names as determining where one confirms, or the fallback its selection yielded where none does — leaving every evaluation as it stood."
criteria:
  - "A case in which exactly one hypothesis confirms answers with an assessment naming that hypothesis as determining."
  - "A case in which two hypotheses confirm answers with an assessment naming as determining the confirmed hypothesis the case lists earliest in its declared order."
  - "A case in which exactly one hypothesis confirms answers with an assessment carrying the resolution the case declared for that hypothesis."
  - "A case in which two hypotheses confirm answers with an assessment carrying the resolution the case declared for the hypothesis it names as determining."
  - "A case in which no hypothesis confirms and whose fallback selection yields its no-data fallback answers with an assessment carrying that fallback."
  - "A case in which no hypothesis confirms and whose fallback selection yields its hypotheses-exhausted fallback answers with an assessment carrying that fallback."
  - "A case in which no hypothesis confirms answers with an assessment naming no determining hypothesis."
  - "The outcome the assessment carries is the outcome of the one resolution the case resolved for this answer, and no other outcome the case holds appears in it."
  - "The referral the assessment carries is the referral of that same resolution, and no other referral the case holds appears in it."
  - "In a case in which two hypotheses confirm, the evaluation of the later-listed confirmed hypothesis still reads back its confirming verdict once the answer is produced."
  - "Producing the answer marks no hypothesis of the case as superseded."
depends_on:
  - task/published-case/case-structure
  - task/published-case/evaluation-record
  - task/published-case/assessment-record
  - task/published-case/fallback-selection
nodes:
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/knowledge/resolution
    digest: sha256:ce017e6342d08120ef1290be156eff861490e031d0e210d96cae2f5bc9f4f1bb
  - node: definition/knowledge/referral
    digest: sha256:7d74b30fc7b7813597b165588a4f8f5b7652235ebac9e320fa49a573f7eb9261
  - node: definition/glossary/outcome
    digest: sha256:40fad9d974f611796cc3974eeb6b311ac0ef6c6de39c5615f3eba4681eedaf2d
  - node: definition/investigation/evaluation
    digest: sha256:1a83f3e12140dd16aff50c46eb1186d6dcdb9711378d045d971bd6f12d5c91de
  - node: definition/investigation/assessment
    digest: sha256:fe01c229097bb5a9b23e1f75b8bbbe60108838df39b8068129c5d7adaa2b69ac
  - node: rule/knowledge/hypotheses-are-ordered-by-precedence
    digest: sha256:c5c1b66cff9265e8aa17c2be46f42bd4377e73801e215d95379cae6d60458fcb
  - node: rule/investigation/the-outcome-comes-from-the-case
    digest: sha256:fe6d313568bdc7eb9aaae70da1220bba3faddc2cf58285d0d9486a598d4ce12b
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This task answers from a published case taken as given; producing the assessment reads the case's hypotheses, order and fallbacks and never reads or sets what derives the version, so no criterion changes with the answer."
  - gap: definition/investigation/assessment#attributes.text.audience
    why: "The criteria reach only the assessment's resolution and determining hypothesis; the text and what it may expose to the end customer belong to the writing, which this task does not produce — see the remainder note."
  - gap: definition/glossary/outcome#attributes.name.values.[]
    why: "The assessment carries the outcome the case's resolution names by identity and no criterion enumerates the vocabulary; the two non-conclusion outcomes the node already states are the only ones the fallback paths could touch, and even those arrive through the fallback resolution rather than by lookup."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "This task answers by whichever order the published case declares; which cause dominates which is the specialists' fact for curation, and no criterion here depends on any particular order being the right one."
---

## What it is
The third of the three behaviours the scope named, turning the verdicts on a case's hypotheses into what the investigation concluded and what somebody should do.
The precedence reading, in which the confirmed hypothesis the case lists earliest is the one that determines the resolution.
The carrying of whichever fallback the selection yielded when nothing confirms, without re-deciding the selection.
The leaving alone of every evaluation, so two hypotheses confirming stays visible after the answer is produced.

## Notes
The two provenance criteria tie what the assessment carries to the one resolution the case resolved, which the construct itself cannot state because it never reads the case.
Criteria 5 and 6 arrange the selection's yield through what the collection returned, but assert only that the assessment carries what was yielded — which fallback is yielded from which results is the selection task's own demonstration.
The last two criteria close the path on which an implementation could drop or overwrite the later confirmed evaluation and still satisfy everything else this task states.
UNDERDETERMINED, from the binding — criteria 1 and 2 test exactly one and two confirmations and no criterion reaches three or more, while the case node and the outcome rule both say the answer is the first confirmed hypothesis in the declared order for any count; what passes is an implementation selecting the earliest-listed confirmed hypothesis only when one or two confirm and any other confirmed one when three or more do.
REMAINDER, from the binding — the assessment declares a required text and its rules on what the writing receives reach no criterion of this task, which produces the resolution and determining-hypothesis parts and not the text; they belong to the writing station of the diagnose process, governed by the narrowed-input rule outside these candidates, which this plan does not hold.
From the binding — criteria 5 and 6 take the fallback selection's yield as given, the fallback rule and the evidence definition deliberately left unbound because the choice between the two fallbacks is the sibling task's; the seam this task honours is only that the assessment carries whichever declared fallback that selection yielded, never a composed third.
From the binding — the objective's input, the evaluations of its hypotheses, is complete only because the one-evaluation-per-hypothesis rule holds upstream on the investigation; that rule is left unbound here because this task consumes evaluations and never builds the investigation the rule constrains.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
