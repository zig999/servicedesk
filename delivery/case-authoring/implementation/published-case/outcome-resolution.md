---
title: "Outcome resolution from a case's evaluations"
summary: "A pure selection that reads a published case's hypotheses in their declared order, its evaluations and the fallback selection's yield to produce the resolution and determining-hypothesis parts of an assessment, leaving every evaluation and every case hypothesis untouched."
task: sha256:ad9c5142543645206f52857d96977efa4da948ee328e19572005c2ea12b8ad04
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/outcome-resolution.ts
    effect: "declares ResolvedOutcome (the resolution and optional determining-hypothesis parts of an Assessment, as Pick<Assessment, 'resolution' | 'determiningHypothesis'>) and resolveOutcome(publishedCase, evaluations, evidence), which walks the case's hypotheses in their declared order to find the earliest one a confirmed evaluation names — for any number of confirmations, not only one or two — and returns that hypothesis's own resolution and name as determining; where none is found it calls selectFallback and returns whichever of the case's two declared fallbacks it yields, with no determining hypothesis; every resolution returned is read back by reference from the case, never composed; evaluations and the case's hypotheses are only ever read"
criteria:
  - criterion: "A case in which exactly one hypothesis confirms answers with an assessment naming that hypothesis as determining."
    met: true
    how: "firstConfirmedHypothesis finds the one hypothesis whose name a confirmed evaluation names, and resolveOutcome carries its name as determiningHypothesis"
  - criterion: "A case in which two hypotheses confirm answers with an assessment naming as determining the confirmed hypothesis the case lists earliest in its declared order."
    met: true
    how: "firstConfirmedHypothesis walks publishedCase.hypotheses in the array order the case itself declares — never the order evaluations lists — and Array.prototype.find returns the first match, so among two confirmed hypotheses the earlier-listed one is named; the same walk handles three or more confirmations identically, since nothing in the logic branches on how many confirmed"
  - criterion: "A case in which exactly one hypothesis confirms answers with an assessment carrying the resolution the case declared for that hypothesis."
    met: true
    how: "resolveOutcome returns confirmedHypothesis.resolution — the resolution embedded in that hypothesis as the case declared it — read back by reference, not copied or recomposed"
  - criterion: "A case in which two hypotheses confirm answers with an assessment carrying the resolution the case declared for the hypothesis it names as determining."
    met: true
    how: "the resolution returned is always confirmedHypothesis.resolution for whichever hypothesis firstConfirmedHypothesis selected as determining, so the resolution and the determining name always come from the same hypothesis"
  - criterion: "A case in which no hypothesis confirms and whose fallback selection yields its no-data fallback answers with an assessment carrying that fallback."
    met: true
    how: "when firstConfirmedHypothesis finds nothing, resolveOutcome calls selectFallback(publishedCase, evaluations, evidence) and returns exactly what it yields as the resolution; selectFallback yields publishedCase.noDataFallback when any evidence carries a result other than ok, and resolveOutcome passes that value through unchanged"
  - criterion: "A case in which no hypothesis confirms and whose fallback selection yields its hypotheses-exhausted fallback answers with an assessment carrying that fallback."
    met: true
    how: "the same call to selectFallback yields publishedCase.hypothesesExhaustedFallback when every evidence carries ok, and resolveOutcome returns that value unchanged as the resolution"
  - criterion: "A case in which no hypothesis confirms answers with an assessment naming no determining hypothesis."
    met: true
    how: "the fallback branch of resolveOutcome always returns determiningHypothesis: undefined, matching how src/investigation/assessment.ts's createAssessment already represents an absent determining hypothesis"
  - criterion: "The outcome the assessment carries is the outcome of the one resolution the case resolved for this answer, and no other outcome the case holds appears in it."
    met: true
    how: "resolveOutcome returns exactly one Resolution object (a hypothesis's own or one fallback), read by reference and never merged with any other; Resolution has exactly one outcome field, so no second outcome the case holds can appear in the answer"
  - criterion: "The referral the assessment carries is the referral of that same resolution, and no other referral the case holds appears in it."
    met: true
    how: "the referral embedded in the same single Resolution object travels with it unread and unopened; resolveOutcome never reads, copies or reassembles a referral, so the one that reaches the answer is exactly the one embedded in the resolution that was returned"
  - criterion: "In a case in which two hypotheses confirm, the evaluation of the later-listed confirmed hypothesis still reads back its confirming verdict once the answer is produced."
    met: true
    how: "firstConfirmedHypothesis only reads evaluation.verdict and evaluation.hypothesis to build a Set of confirmed names and never assigns to, filters out of, or otherwise changes the evaluations array or any evaluation object; the later-listed confirmed hypothesis's evaluation is the same object afterward, verdict intact"
  - criterion: "Producing the answer marks no hypothesis of the case as superseded."
    met: true
    how: "the Hypothesis type has no supersession field at all, and resolveOutcome never writes to publishedCase.hypotheses or to any hypothesis in it — it only reads names and resolutions — so there is no channel through which producing the answer could mark one"
nodes:
  - node: definition/knowledge/case
    encoded_at:
      - src/knowledge/outcome-resolution.ts
    how: "reads the case's hypotheses in the array order the case itself declares, without ever reordering it, to find the earliest confirmed one, and reads its two declared fallback resolutions only by calling selectFallback; the case's slug, title, when-to-use, subject type, curator notes, version and content hash are untouched because no criterion here reaches them, and the waived version-derivation gap plays no part since this module never reads or sets what derives the version"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/outcome-resolution.ts
    how: "reads a hypothesis's name, to test it against the set of confirmed evaluation names, and its embedded resolution, to carry forward unchanged when it is the determining one; the criterion string and the concepts it collects are untouched, reached by no criterion of this task"
  - node: definition/knowledge/resolution
    how: "honored, not further encoded — the module carries whichever resolution is chosen (a hypothesis's own or a fallback) by reference exactly as the case declared it, adding nothing to it and building nothing new, which is how the source honors the node's rule that a resolution is declared by the case and never produced during an investigation"
  - node: definition/knowledge/referral
    how: "honored, not encoded — the referral embedded in whichever resolution is chosen passes through this module unopened and unread, so no other referral the case holds can be substituted or mixed in"
  - node: definition/glossary/outcome
    how: "honored, not encoded — the outcome embedded in whichever resolution is chosen passes through by identity, unread and unchanged; no outcome name is looked up, compared, enumerated or invented here, consistent with the task's own waived gap over the outcome vocabulary"
  - node: definition/investigation/evaluation
    encoded_at:
      - src/knowledge/outcome-resolution.ts
    how: "reads each evaluation's hypothesis name and verdict to decide which hypothesis, if any, confirmed; the evaluations argument and every evaluation in it are only ever read, never written to, filtered destructively, or replaced, which is how the source honors the node's own statement that precedence never marks a hypothesis as superseded and that an evaluation keeps the verdict it received even once an earlier hypothesis has won"
  - node: definition/investigation/assessment
    encoded_at:
      - src/knowledge/outcome-resolution.ts
    how: "ResolvedOutcome is declared as Pick<Assessment, 'resolution' | 'determiningHypothesis'> — exactly the two attributes this task's criteria reach; the node's third, required text attribute is deliberately absent from this type and from everything this module returns, per the task's REMAINDER note placing the text with the writing station this plan does not hold, and the waived text.audience gap is consistent with that: nothing here decides what the text may expose"
  - node: rule/knowledge/hypotheses-are-ordered-by-precedence
    encoded_at:
      - src/knowledge/outcome-resolution.ts
    how: "firstConfirmedHypothesis walks publishedCase.hypotheses in the array order the case declares them — trusting that order as the precedence this rule holds it to be — rather than in the order evaluations happens to list them, and Array.prototype.find returns the first match in that walk regardless of how many hypotheses confirmed"
  - node: rule/investigation/the-outcome-comes-from-the-case
    encoded_at:
      - src/knowledge/outcome-resolution.ts
    how: "resolveOutcome never produces an outcome or a referral of its own; it returns one of the case's own resolutions by reference — a hypothesis's own resolution where one confirmed, or one of the two fallback resolutions selectFallback yields where none did — so what reaches the answer is exactly what the case resolved, both the confirmed and the fallback paths"
inferences:
  - inferred: "the earliest-confirmed-hypothesis search is implemented as one general walk over any number of confirmed hypotheses, rather than as logic special-cased to exactly one or exactly two confirmations"
    from: "the case node's own prose — it answers with the first confirmed one in its declared order — and rule/investigation/the-outcome-comes-from-the-case's restatement of the same fact, both stated for any count of confirmations even though criteria 1 and 2 test only one and two; the task's own UNDERDETERMINED note names this exact gap between the criteria and the base and states the base's fact is general, so the general reading is what the base holds rather than an invention beyond it"
  - inferred: "the fallback branch represents an absent determining hypothesis as the key set explicitly to undefined, not omitted from the returned object"
    from: "src/investigation/assessment.ts's createAssessment, which already represents an absent determining hypothesis the same way, and the assessment-record implementation's recorded inference that this representation is one a later consumer — this task, by the inventory's own note — depends on"
  - inferred: "where selectFallback returns undefined despite no hypothesis of the case confirming, resolveOutcome throws rather than silently choosing a fallback or asserting past the type checker"
    from: "this state is unreachable under rule/investigation/one-evaluation-per-hypothesis and the hypothesis node's own uniqueness-of-name rule, both of which guarantee every confirming evaluation names a hypothesis the case actually declares; the throw exists only to satisfy the project's standard's rules against an unguarded assertion or an any type, without inventing a domain outcome for a state the base's own invariants rule out, and it is not a business decision — no caller depends on behavior here because the base does not let this branch occur"
preserved:
  - "fallback-selection.ts's existing contract — undefined when any evaluation confirms, otherwise the case's own hypothesesExhaustedFallback or noDataFallback chosen from the evidence results — which this module calls into and must keep meaning exactly what task/published-case/fallback-selection delivered"
  - "assessment.ts's Assessment type and createAssessment's signature, unmodified; ResolvedOutcome is defined against that type with Pick rather than by redeclaring its shape, so a later change to Assessment's two carried attributes is felt here rather than silently drifting"
  - "case.ts's hypotheses array reading back in exactly the order the case was constructed with, which this module's precedence walk depends on and does not itself re-derive or re-check"
  - "evaluation.ts's guarantee that a constructed evaluation's verdict, reason and citations read back unchanged — this module never calls createEvaluation or otherwise touches an evaluation's own construction, only reading the frozen values already produced"
deferred:
  - what: "the writing of the assessment's text, and the narrowing of what the writing receives (the report and confirmed hypothesis's evidence, or every hypothesis's verdict and reason) that definition/investigation/assessment's Rules describe"
    why: "the task's own REMAINDER note places this with the writing station of the diagnose process, which this plan does not hold; this module produces only the resolution and determining-hypothesis parts of an assessment and stops there"
  - what: "constructing a full Assessment value via src/investigation/assessment.ts's createAssessment"
    why: "createAssessment requires a text this task does not produce; combining this module's ResolvedOutcome with a text into a full Assessment is left to whichever task builds that text, as the task's REMAINDER note anticipates"
  - what: "the repository still holds no package manifest, compiler configuration or lock, so src/knowledge/outcome-resolution.ts has never been type-checked, the same as every other file in the tree"
    why: "establishing the toolchain is no criterion of this task and reaches every file under src/, not only this one; the inventory and every sibling implementation record already note the same absence"
---

## What it is

The third of the three behaviours the scope named, turning the verdicts on a case's hypotheses into what the investigation concluded and what somebody should do — the precedence reading, in which the confirmed hypothesis the case lists earliest is the one that determines the resolution, the carrying of whichever fallback the selection yielded when nothing confirms without re-deciding the selection, and the leaving alone of every evaluation, so two hypotheses confirming stays visible after the answer is produced.

## Notes

The two provenance criteria tie what the assessment carries to the one resolution the case resolved, which the construct itself cannot state because it never reads the case.
Criteria 5 and 6 arrange the selection's yield through what the collection returned, but assert only that the assessment carries what was yielded — which fallback is yielded from which results is the selection task's own demonstration.
The last two criteria close the path on which an implementation could drop or overwrite the later confirmed evaluation and still satisfy everything else this task states.
The standard was read in full and no rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
