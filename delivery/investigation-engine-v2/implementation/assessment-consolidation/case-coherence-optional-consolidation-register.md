---
title: Case admits an optional consolidation register
summary: The Case aggregate and its parser admit an optional consolidation_register (formal or plain), reusing the vocabulary type already declared for assessment-consolidator rather than redeclaring it.
task: sha256:8cf6cb79ca9b36c16b1465a61cfd3296f24a0b9de7b9da8fbadba49869da90db
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/assessment-consolidation-case-coherence-optional-consolidation-register-build
files:
  - path: src/case/case.ts
    effect: "the Case type now declares an optional consolidation_register field, typed against ConsolidationRegister imported from src/investigation/consolidation-register.ts rather than redeclared; Referral, Resolution, Hypothesis and CASE_DOCUMENT_ENDING are unchanged."
  - path: src/case/parse-case-document.ts
    effect: "imports ConsolidationRegister/CONSOLIDATION_REGISTERS. documentProblems now runs a new consolidationRegisterProblems check against document.consolidation_register, collected into the same single list every other structural check already returns into; a declared value outside formal/plain is named as a problem via a new isConsolidationRegister type guard, and an undeclared value is no problem at all. heldCase now carries consolidation_register through onto the returned Case exactly where the document declares it, via a conditional spread, and omits the key entirely where the document leaves it undeclared."
criteria:
  - criterion: "A case document declaring consolidation_register formal or consolidation_register plain parses into a Case carrying that value."
    met: true
    how: "isConsolidationRegister accepts exactly formal or plain (the CONSOLIDATION_REGISTERS set), so consolidationRegisterProblems reports no problem for either; heldCase's conditional spread then copies document.consolidation_register onto the Case parseCaseDocument returns."
  - criterion: "A case document omitting consolidation_register parses successfully, never refused for the field's absence."
    met: true
    how: "consolidationRegisterProblems returns an empty array when the value is undefined — unlike every other required attribute's own check, it raises no is-undeclared problem — and heldCase's conditional spread adds nothing to the returned object in that case."
  - criterion: "A consolidation_register value outside formal or plain is refused, collected together with any other structural or coherence violation the same document holds, never thrown on the first violation found."
    met: true
    how: "a declared value failing isConsolidationRegister adds one entry to the array documentProblems builds by concatenating every check's own list; only after that whole array is built does refuseStructuralViolations throw once, via InvalidCaseDocumentError naming every problem together — the same convention every existing check in this file already follows, never an early throw."
  - criterion: "The Case that parse-case-document holds and returns carries consolidation_register through when the raw document declares it, rather than dropping it."
    met: true
    how: "heldCase's new conditional spread places the declared value onto the object heldCase constructs and parseCaseDocument returns; before this change heldCase's fixed field list had no such entry and would have dropped it, which is exactly the gap the task's own Notes named."
nodes:
  - node: domain/knowledge/case
    encoded_at:
      - src/case/case.ts
      - src/case/parse-case-document.ts
    how: "case.ts's Case type gains the consolidation_register attribute exactly as the node declares it — optional, typed against consolidation-register — and parse-case-document.ts applies and carries it through at the one JSON document boundary the node's own description names."
  - node: domain/knowledge/consolidation-register
    encoded_at:
      - src/case/case.ts
      - src/case/parse-case-document.ts
    how: "the node's closed two-value vocabulary is reused, not redeclared: both files import ConsolidationRegister/CONSOLIDATION_REGISTERS from src/investigation/consolidation-register.ts (already delivered by task/assessment-consolidation/assessment-consolidator-port-and-fake). isConsolidationRegister enforces membership in exactly that closed set at the case-parsing boundary."
  - node: constraints/the-domain-depends-on-no-infrastructure
    how: "honored, not encoded. The only import either changed file gained is the consolidation-register vocabulary's own plain type/value set, itself free of any import, so no framework, driver or client reaches either file; the existing fitness test at src/__tests__/unit/case/case-document-modules.spec.ts still finds none."
inferences:
  - inferred: "ConsolidationRegister/CONSOLIDATION_REGISTERS are imported into src/case/case.ts and src/case/parse-case-document.ts from src/investigation/consolidation-register.ts, rather than declaring a second type inside src/case — the first import src/case has ever carried, and the first import running from src/case toward src/investigation."
    from: "the launching instruction naming that exact module/type pair as already existing and to be reused rather than redeclared, and that module's own header comment, which already anticipated this task landing."
  - inferred: "the consolidation_register value check belongs entirely to parse-case-document.ts's structural checks, not to validate-case-coherence.ts's glossary-backed checks, so validate-case-coherence.ts needed no code change."
    from: "domain/knowledge/consolidation-register's own description distinguishing this vocabulary from a glossary-discovered one (fixed and known ahead of time, never a growing set a new case could extend), and none of the task's four criteria naming a coherence-time check for this field."
  - inferred: "the refusal wording (consolidation_register is not one of formal, plain) for a declared value outside the vocabulary names what is wrong without quoting the offending raw value."
    from: "no node or criterion states exact wording; the phrasing follows the style of this file's other type-shape violations that also omit the offending value."
  - inferred: "heldCase omits the consolidation_register key entirely from the object it returns when the document leaves it undeclared, rather than carrying it as an explicit consolidation_register: undefined."
    from: "case-resolution.ts's own resolveOutcome, which likewise omits its optional determining field entirely rather than setting it to undefined, and parse-case-document.ts's own documented convention that heldCase carries exactly the declared attributes."
  - inferred: "the consolidation_register check sits between the fallback check and the hypotheses check in documentProblems."
    from: "domain/knowledge/case's own attribute order (fallback, then consolidation_register, then the hypotheses relationship), and the file's existing convention of running its checks in the document's declared attribute order."
  - inferred: "isConsolidationRegister is written as CONSOLIDATION_REGISTERS.some(...) rather than an as-assertion plus includes()."
    from: "the project's standard rule TYP-02 (a type assertion is accompanied by a guard that narrows it) — the .some() form needs no as assertion at all, matching this file's existing assertion-free guard style."
preserved:
  - "every previously-required case document attribute (slug, title, when_to_use, version, hash, subject, fallback, hypotheses) still refuses on the same absence/type/emptiness conditions, with the same messages and in the same relative order, since none of their check functions were touched."
  - "heldCase still returns slug, title, when_to_use, version, hash, subject, fallback and hypotheses exactly as before for a document that declares no consolidation_register — the new field is additive only, never displacing or reordering the existing ones."
  - "parseCaseDocument's refuse-once-with-every-violation-named behavior is unchanged in shape; the new check only contributes one more entry to the same collected list."
  - "validate-case-coherence.ts's existing coherence checks are unchanged and continue to operate over the Case type without referencing consolidation_register."
---

## What it is

case.ts's Case type, parse-case-document.ts each extended for an optional consolidation_register, reusing the vocabulary declared by the assessment-consolidator task rather than redeclaring it.

## Notes

None.
