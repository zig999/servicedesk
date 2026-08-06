---
title: "Primeira leva — seis entregas do plano case-authoring"
summary: "Quatro passes sobre as seis primeiras tasks entregues: cobertura total, conformidade com a base sem achados, sete achados de standard, e o passe de falhas sem entrada."
reviewed:
  - "src/investigation/assessment.ts"
  - "src/investigation/evaluation.ts"
  - "src/knowledge/case.ts"
  - "src/knowledge/draft-case.ts"
  - "src/knowledge/hypothesis.ts"
  - "src/knowledge/referral.ts"
  - "src/knowledge/refusal.ts"
  - "src/knowledge/required-evaluations.ts"
  - "src/knowledge/resolution.ts"
  - "src/knowledge/validation.ts"
  - "src/glossary/action.ts"
  - "src/glossary/concept.ts"
  - "src/glossary/lookup.ts"
  - "src/glossary/observation-field.ts"
  - "src/glossary/outcome.ts"
  - "src/glossary/recipient.ts"
  - "src/glossary/subject-type.ts"
  - "src/__tests__/unit/glossary/lookup.spec.ts"
  - "src/__tests__/unit/investigation/assessment.spec.ts"
  - "src/__tests__/unit/investigation/evaluation.spec.ts"
  - "src/__tests__/unit/knowledge/case.spec.ts"
  - "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
  - "src/__tests__/unit/knowledge/validation.spec.ts"
tasks:
  - task/published-case/assessment-record
  - task/published-case/case-structure
  - task/case-validator/validation-run
  - task/case-validator/glossary-lookup
  - task/published-case/evaluation-record
  - task/published-case/required-evaluations
passes:
  - pass: coverage
  - pass: conformance
  - pass: standard
  - pass: failures
    missing: "no commands were supplied and no run was captured — the repository holds no package manifest, compiler configuration or installable test runner, so nothing was named to execute"
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
coverage:
  - criterion: "An assessment reads back the resolution it was constructed with."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "reads back the resolution it was constructed with"
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "reads back the outcome it was constructed with after the resolution handed in is changed"
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "reads back the action it was constructed with after the referral handed in is changed"
  - criterion: "An assessment carries exactly one resolution."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "carries only one resolution when it is handed a part naming a second one"
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "reads its resolution back as one resolution and not as a collection of them"
  - criterion: "An assessment constructed with a determining hypothesis reads back that hypothesis by the name unique within its case."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "reads back the determining hypothesis it was constructed with, by name"
  - criterion: "An assessment constructed with no determining hypothesis reads back none and is not refused for carrying none."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "constructs an assessment given no determining hypothesis rather than refusing it"
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "reads back no determining hypothesis when it was constructed without one"
  - criterion: "An assessment reads back the text it was constructed with."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/assessment.spec.ts"
        name: "reads back the text it was constructed with, character for character"
  - criterion: "A case reads back the slug it was declared with."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the slug it was declared with"
  - criterion: "A case reads back the title it was declared with."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the title it was declared with"
  - criterion: "A case reads back the when-to-use guidance it was declared with."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the when-to-use guidance it was declared with, character for character"
  - criterion: "A case reads back the version it was declared with."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the version it was declared with"
  - criterion: "A case reads back the content hash it was declared with."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the content hash it was declared with"
  - criterion: "A case declared with curator notes reads them back, and a case declared without them reads back none."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the curator notes it was declared with, character for character"
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back no curator notes when it was declared without them"
  - criterion: "A case reads back the subject type it declares."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the subject type it declares"
  - criterion: "A case constructed with its hypotheses in a given order lists them back in that same order."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "lists its hypotheses back in the order it declared them"
  - criterion: "A hypothesis reads back the name that identifies it within its case."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the name that identifies a hypothesis within its case"
  - criterion: "A hypothesis reads back the criterion it was declared with."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the criterion a hypothesis was declared with, character for character"
  - criterion: "A hypothesis reads back the concepts it collects."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the concepts a hypothesis collects, in their declared order"
  - criterion: "A hypothesis reads back the resolution that follows when it holds."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the resolution that follows a hypothesis when it holds"
  - criterion: "A case reads back the resolution it declares as its no-data fallback."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the resolution it declares as its no-data fallback"
  - criterion: "A case reads back the resolution it declares as its hypotheses-exhausted fallback."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads back the resolution it declares as its hypotheses-exhausted fallback"
  - criterion: "A resolution reads back both the outcome and the referral it was declared with."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads a declared resolution back with both its outcome and its referral"
  - criterion: "A referral reads back both the action and the recipient it was declared with."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/case.spec.ts"
        name: "reads a declared referral back with both its action and its recipient"
  - criterion: "A run with no check registered does not refuse the case it is given."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/validation.spec.ts"
        name: "answers no refusal for a case when no check is registered"
  - criterion: "A run whose every registered check refuses nothing does not refuse the case it is given."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/validation.spec.ts"
        name: "answers no refusal when every registered check refuses nothing"
  - criterion: "A run with one registered check that refuses the given case refuses that case."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/validation.spec.ts"
        name: "refuses the case it is given when its one registered check refuses it"
  - criterion: "A run with two registered checks that both refuse the given case reports both refusals."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/validation.spec.ts"
        name: "reports both refusals when two registered checks both refuse the case"
  - criterion: "A run reports no refusal that no registered check produced."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/validation.spec.ts"
        name: "reports no refusal that no registered check produced"
      - file: "src/__tests__/unit/knowledge/validation.spec.ts"
        name: "answers the collected refusals themselves as the whole of its answer"
  - criterion: "A term the glossary publishes as a concept is answered as published when looked up as a concept."
    state: covered
    tests:
      - file: "src/__tests__/unit/glossary/lookup.spec.ts"
        name: "answers a term the glossary publishes as a concept as published when looked up as a concept"
  - criterion: "A term the glossary publishes no entry for is answered as not published under any kind."
    state: covered
    tests:
      - file: "src/__tests__/unit/glossary/lookup.spec.ts"
        name: "answers a term the glossary publishes no entry for as not published under any kind"
  - criterion: "A term the glossary publishes as an outcome is answered as not published when looked up as an action."
    state: covered
    tests:
      - file: "src/__tests__/unit/glossary/lookup.spec.ts"
        name: "answers a term the glossary publishes as an outcome as not published when looked up as an action"
      - file: "src/__tests__/unit/glossary/lookup.spec.ts"
        name: "answers a term the glossary publishes as an outcome as published when looked up as an outcome"
  - criterion: "A term the glossary publishes as a concept is yielded as the glossary records it when looked up as a concept."
    state: covered
    tests:
      - file: "src/__tests__/unit/glossary/lookup.spec.ts"
        name: "yields the published concept as the glossary records it, with its name, accepted subject types, ttl and observation fields"
  - criterion: "The lookup answers from the glossary it was given and holds no term of its own."
    state: covered
    tests:
      - file: "src/__tests__/unit/glossary/lookup.spec.ts"
        name: "answers nothing as published from a glossary publishing nothing"
      - file: "src/__tests__/unit/glossary/lookup.spec.ts"
        name: "answers one term differently from two glossaries, published exactly where the given one publishes it"
  - criterion: "An evaluation reads back the name of the one hypothesis it decided."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/evaluation.spec.ts"
        name: "reads back the name of the one hypothesis it decided"
  - criterion: "An evaluation carries exactly one hypothesis name."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/evaluation.spec.ts"
        name: "carries only one hypothesis name when it is handed a part naming a second one"
  - criterion: "An evaluation constructed without a verdict is refused."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/evaluation.spec.ts"
        name: "refuses a construction that gives no verdict, naming the verdict as what is absent"
      - file: "src/__tests__/unit/investigation/evaluation.spec.ts"
        name: "refuses a construction whose parsed verdict is null the same way as one giving none"
  - criterion: "An evaluation reads back the verdict it received."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/evaluation.spec.ts"
        name: "reads each of the three verdicts back as the verdict it was given"
  - criterion: "An evaluation whose verdict is inconclusive reads back why it could not decide."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/evaluation.spec.ts"
        name: "reads back why it could not decide when the verdict it carries is inconclusive"
      - file: "src/__tests__/unit/investigation/evaluation.spec.ts"
        name: "reads each of the three declared reasons back as the reason it was given"
  - criterion: "An evaluation reads back the verdict it received even when a hypothesis the case lists earlier has already confirmed."
    state: covered
    tests:
      - file: "src/__tests__/unit/investigation/evaluation.spec.ts"
        name: "reads back the verdict it received when an evaluation of an earlier hypothesis has already confirmed"
  - criterion: "Every hypothesis the case declares appears in the answer."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
        name: "answers with a name for every hypothesis the case declares"
  - criterion: "No name absent from the case's declared hypotheses appears in the answer."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
        name: "answers with no name absent from the case's declared hypotheses"
  - criterion: "A case declaring one hypothesis answers with exactly one entry."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
        name: "answers with exactly one entry for a case declaring one hypothesis"
  - criterion: "Each entry of the answer carries the hypothesis name that identifies it within its case."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
        name: "carries the hypothesis name that identifies it within its case, on each entry"
      - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
        name: "stands the entries in the order the case declares its hypotheses"
  - criterion: "The entries of the answer stand in the order the case declares its hypotheses."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
        name: "stands the entries in the order the case declares its hypotheses"
  - criterion: "A case whose declared hypotheses are reordered answers with its entries reordered the same way."
    state: covered
    tests:
      - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
        name: "reorders its entries the same way across two published cases whose declared orders differ"
findings:
  - pass: standard
    file: "src/__tests__/unit/glossary/lookup.spec.ts"
    where: "lines 1-2, the imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the suite is written against Node's built-in test runner rather than Vitest, so the project's test script either does not exercise this file at all or a second runner has been introduced beside Vitest without being declared, and a reader trusting the standard's own claim that Vitest is the one runner cannot tell which from this file alone"
    correction: "import describe/it/expect (or the project's chosen equivalents) from vitest instead of node:test and node:assert/strict"
  - pass: standard
    file: "src/__tests__/unit/investigation/assessment.spec.ts"
    where: "lines 1-2, the imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the suite is written against Node's built-in test runner rather than Vitest, so the project's test script either does not exercise this file at all or a second runner has been introduced beside Vitest without being declared"
    correction: "import describe/it/expect from vitest instead of node:test and node:assert/strict"
  - pass: standard
    file: "src/__tests__/unit/investigation/evaluation.spec.ts"
    where: "lines 1-2, the imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the suite is written against Node's built-in test runner rather than Vitest, so the project's test script either does not exercise this file at all or a second runner has been introduced beside Vitest without being declared"
    correction: "import describe/it/expect from vitest instead of node:test and node:assert/strict"
  - pass: standard
    file: "src/__tests__/unit/knowledge/case.spec.ts"
    where: "lines 1-2, the imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the suite is written against Node's built-in test runner rather than Vitest, so the project's test script either does not exercise this file at all or a second runner has been introduced beside Vitest without being declared"
    correction: "import describe/it/expect from vitest instead of node:test and node:assert/strict"
  - pass: standard
    file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    where: "lines 1-2, the imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the suite is written against Node's built-in test runner rather than Vitest, so the project's test script either does not exercise this file at all or a second runner has been introduced beside Vitest without being declared"
    correction: "import describe/it/expect from vitest instead of node:test and node:assert/strict"
  - pass: standard
    file: "src/__tests__/unit/knowledge/validation.spec.ts"
    where: "lines 1-2, the imports"
    cites: STK-10
    evidence: "import assert from 'node:assert/strict';\nimport { describe, it } from 'node:test';"
    cost: "the suite is written against Node's built-in test runner rather than Vitest, so the project's test script either does not exercise this file at all or a second runner has been introduced beside Vitest without being declared"
    correction: "import describe/it/expect from vitest instead of node:test and node:assert/strict"
  - pass: standard
    file: "src/knowledge/case.ts"
    where: "lines 45-57, copyReferral and copyResolution"
    cites: MNT-03
    evidence: "function copyReferral(referral: Referral): Referral {\n  return Object.freeze({\n    action: referral.action,\n    recipient: referral.recipient,\n  });\n}\n\nfunction copyResolution(resolution: Resolution): Resolution {\n  return Object.freeze({\n    outcome: resolution.outcome,\n    referral: copyReferral(resolution.referral),\n  });\n}"
    cost: "the identical pair of functions already exists in src/investigation/assessment.ts (lines 28-40), so a fix to how a referral or resolution is copied — say, a field added to either shape — has to be made in both files, and the one nobody remembers to touch is the one that silently reads back stale data"
    correction: "extract copyReferral and copyResolution into one shared module both files import, rather than each declaring its own copy"
---

## What it is

Four passes over the first six tasks the plan case-authoring delivered — the assessment construct, the published case structure, the validation run, the glossary lookup, the evaluation record and the required-evaluations answer — and the tests that prove them.
Coverage found every one of the 43 stated criteria across the six tasks proven by a test that would fail if the criterion stopped holding.
Conformance with the base found nothing to report: no domain fact stated that the bound nodes do not hold, none contradicted, and no base fact given a second home in source.
The standard found seven departures, six of one rule and one of another: every spec file imports node:test and node:assert/strict where the standard names Vitest, and the copy-on-construct helpers for a resolution and a referral are duplicated verbatim between two modules.
The failures pass did not run: no command was named and no run was captured, because the repository holds no package manifest, compiler configuration or installable test runner.

## Notes

The MNT-03 finding was already disclosed as a divergence in the case-structure implementation record, with its own reasoning for why unifying the two modules' copy helpers reached past that task's objective; the standard pass was not shown that disclosure, and the finding here rests on the source alone.
The STK-10 finding recurs across every spec file in the set because each was written by a separate delivery following the same tree precedent — the first spec's author recorded that Vitest names a runner the tree does not have installed, and every later spec followed that same file rather than introducing a second, undeclared runner.
The coverage pass corrected the reviewer's own miscount: the six tasks state 43 criteria in total, not the 38 first estimated when spawning the pass, and all 43 were paired rather than any being silently dropped.
The conformance pass looked past two matters it judged as coverage or maintenance rather than domain-fact conflicts: the Evaluation type's total omission of the base's optional citations attribute (already tracked as a deferred item in the evaluation-record implementation record), and the hand-maintained GlossaryKind literal union that must be kept in sync by hand as glossary kinds are added.
The standard pass looked past the hand-written presence/absence checks in createEvaluation and createCase, judging that STK-08 (no hand-written type guard at a boundary) reaches HTTP/tool-argument/environment parsing and not an internal domain-object constructor.
This review does not judge whether the source is correct, complete, or ready for anything; it reports what four passes observed, and what they mean for the change is a reader's decision.
