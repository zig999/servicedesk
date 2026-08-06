---
title: "The check that every collected concept declares a ttl"
summary: "The publication check that refuses a case under edit, once per concept a hypothesis collects whose glossary entry declares no ttl, deciding on presence alone."
task: sha256:9b2a210287547d8d7546838419cbeabb6707fba829b41c3dae06c18319bc7ecf
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/every-collected-concept-declares-a-ttl.ts
    effect: "declares createEveryCollectedConceptDeclaresATtlCheck(glossary), a factory yielding a PublicationCheck that walks every hypothesis of the case under edit and every concept name it collects, looks each up through the shared glossary lookup, and pushes one refusal — naming the rule, the hypothesis and the offending concept as the offended term — for every looked-up concept whose record does not declare a ttl (tested with the `in` operator against the record, never by reading or comparing the value); a concept absent from the given glossary produces no refusal here, and an empty hypotheses list or an empty collects list is walked without throwing"
criteria:
  - criterion: "A case collecting one concept that declares no ttl is refused by this check."
    met: true
    how: "the concept is found via publishedConcept(), declaresATtl(concept) — 'ttl' in concept — answers false, and one refusal is pushed naming the rule, the collecting hypothesis and the concept; a non-empty answer is the case refused by this check"
  - criterion: "A case whose every collected concept declares a ttl is not refused by this check."
    met: true
    how: "for every hypothesis and every concept it collects, the looked-up record carries the ttl field so declaresATtl() answers true, the inner condition never holds, no refusal is ever pushed, and the check answers a frozen empty array"
  - criterion: "The check decides on the presence of the concept's declared ttl and compares no ttl against another."
    met: true
    how: "declaresATtl() tests only 'ttl' in concept — presence on the record the glossary handed back — and the function never reads what concept.ttl holds, never reads its unit and performs no comparison between one concept's ttl and another's or against any threshold; the only other field a matched concept contributes is its own name, used solely as the refusal's offended term"
nodes:
  - node: rule/knowledge/every-collected-concept-declares-a-ttl
    encoded_at:
      - src/knowledge/every-collected-concept-declares-a-ttl.ts
    how: "the check's whole behaviour is this rule's own statement, read as declaresATtl(concept) === false over every concept a hypothesis collects; the produced refusal's rule field carries the node's own path unchanged and its text quotes the node's statement unchanged, 'Every concept a case names MUST declare a ttl in the glossary.'"
  - node: definition/glossary/concept
    encoded_at:
      - src/knowledge/every-collected-concept-declares-a-ttl.ts
    how: "the check reads a concept's presence of a declared ttl through the shared lookup's published Concept record (src/glossary/concept.ts) rather than restating the shape, and reads nothing else the node declares — no accepts list, no observation fields, no capability. The task's waived gap, attributes.ttl.unit, is untouched: the check never reads the ttl's value or unit, only whether the field is present on the record at all"
  - node: definition/knowledge/draft-case
    encoded_at:
      - src/knowledge/every-collected-concept-declares-a-ttl.ts
    how: "the check walks draftCase.hypotheses[].collects over the shape draft-case.ts already declares, walking an empty hypotheses list without throwing, honoring the node's own statement that a case under edit is what a publication check refuses"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/every-collected-concept-declares-a-ttl.ts
    how: "the check walks each hypothesis's own collects list — concept names bound by identity, unchanged from hypothesis.ts — and names the offending hypothesis by its own identity field, hypothesis.name, in each refusal it produces"
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    how: "the check never throws over an empty hypotheses list, a hypothesis with an empty collects list, or a concept the given glossary does not publish — each simply narrows or empties what is inspected — honoring the rule's clause that a check must be safe over a malformed case, though the task's own UNDERDETERMINED note leaves that optional here. Per the task's own REMAINDER note, the rule's other two clauses — that a validation runs every check regardless of an earlier one's decision and answers with everything produced — reach no criterion of this task and are the validation-run task's, already delivered at src/knowledge/validation.ts"
inferences:
  - inferred: "the module and its exported factory are named after the rule node's own slug, every-collected-concept-declares-a-ttl, rather than the task's own shorter slug, concept-declares-a-ttl"
    from: "the tree's own precedent: the concept-accepts-the-subject-type task's delivered file and factory are named concept-accepts-the-declared-subject-type after its rule node's slug rather than the task's own, and the at-least-one-hypothesis task's file follows the same pattern for case-has-at-least-one-hypothesis"
  - inferred: "the check is built by a factory, createEveryCollectedConceptDeclaresATtlCheck(glossary): PublicationCheck, rather than a plain function taking the glossary and the case as two parameters"
    from: "PublicationCheck's own declared contract at src/knowledge/validation.ts is a function of the whole case under edit alone, and validate() takes a checks list of exactly that shape; closing over the glossary at construction is what lets whatever assembles the checks list register this check with no adaptation, the same way createConceptAcceptsTheDeclaredSubjectTypeCheck already does for its own glossary-consuming check"
  - inferred: "presence of a concept's declared ttl is tested with the `in` operator against the concept record the lookup returns, rather than by comparing concept.ttl to undefined"
    from: "the Concept shape (src/glossary/concept.ts) declares ttl as a required number, so a direct equality comparison against undefined would compare two statically disjoint types under the project's strict-typecheck rule; the `in` operator asks the same question — whether the field is present on the record the glossary actually handed back — without contradicting the type the shared shape declares, the same way draft-case.ts's own admitted-empty hypotheses list is read by its length rather than by an optional flag"
  - inferred: "a concept name a hypothesis collects that the given glossary does not publish produces no refusal from this check"
    from: "rule/knowledge/a-validation-answers-with-every-refusal guarantees the terms-exist-in-the-glossary check runs regardless and owns that refusal, together with the identical choice already recorded by the concept-accepts-the-declared-subject-type implementation for the same situation"
  - inferred: "the check walks an empty hypotheses list and a hypothesis with an empty collects list without throwing"
    from: "the task's own UNDERDETERMINED note that leaves this open, together with the tree's existing precedent at case-has-at-least-one-hypothesis.ts and concept-accepts-the-declared-subject-type.ts and the every-refusal rule's clause that a check should be safe over a malformed case"
  - inferred: "the refusal's rule field is the literal string 'rule/knowledge/every-collected-concept-declares-a-ttl', the node's own path, and the curator-facing text quotes the node's statement attribute unchanged"
    from: "the base's path-is-identity convention together with definition/knowledge/refusal's own doc comment, and the identical choice already recorded by the case-has-at-least-one-hypothesis and concept-accepts-the-declared-subject-type implementations for their own rule and text fields"
  - inferred: "the offended term named in the refusal is the concept's own record name (concept.name) rather than the raw string the hypothesis's collects list names"
    from: "the identical choice already recorded by the concept-accepts-the-declared-subject-type implementation, supported by the shared lookup's own contract that publishedConcept only yields a record whose name matches the looked-up term under exact comparison"
  - inferred: "the returned refusals array is frozen with Object.freeze"
    from: "the tree's existing copy/freeze habit at validate(), requiredEvaluations(), caseHasAtLeastOneHypothesis and createConceptAcceptsTheDeclaredSubjectTypeCheck, all of which freeze what they hand back"
preserved:
  - "PublicationCheck's type and validate() at src/knowledge/validation.ts are untouched, and the new check's inner closure matches PublicationCheck structurally so it can be registered into validate()'s checks list with no change there"
  - "DraftCase at src/knowledge/draft-case.ts, Hypothesis at src/knowledge/hypothesis.ts and Refusal at src/knowledge/refusal.ts are untouched and read exactly as declared"
  - "PublishedGlossary and publishedConcept at src/glossary/lookup.ts, and Concept at src/glossary/concept.ts, are untouched and consumed exactly as declared, including that publishedConcept yields the glossary's own Concept record rather than a copy"
  - "caseHasAtLeastOneHypothesis at src/knowledge/case-has-at-least-one-hypothesis.ts and createConceptAcceptsTheDeclaredSubjectTypeCheck at src/knowledge/concept-accepts-the-declared-subject-type.ts, the tree's existing publication checks, are untouched and unaffected by this addition"
  - "every existing spec under src/__tests__/unit/ exercises only modules this delivery did not touch, and continues to hold unchanged"
deferred:
  - what: "assembling the full list of publication checks a real validation run registers, and wiring createEveryCollectedConceptDeclaresATtlCheck's result into that list alongside a glossary"
    why: "validate() takes the checks list as a parameter supplied by its caller; per the validation-run task's own binding note, each check is a parameter of the run and whatever assembles the checks list is its own concern outside every individual check task"
  - what: "the sibling checks of this epic that also consume the glossary lookup — terms-exist-in-the-glossary, recipient-is-a-role, unique-hypothesis-names, hypothesis-collects-a-concept, read-only-capability"
    why: "each is its own task of this epic, and writing one here would reach past this task's objective, which is exactly the ttl-presence check"
  - what: "the repository still holds no package manifest, compiler configuration or lock, so src/knowledge/every-collected-concept-declares-a-ttl.ts has never been type-checked, the same as every other file already in the tree"
    why: "establishing the toolchain is no criterion of this task and reaches every file in src/, not only this one; the inventory and every prior delivery already record the absence"
---

## What it is

The vocabulary check standing behind the base's statement that how stale a fact may be is stated by the concept — a refusal decided by the presence of the concept's declaration, read through the shared glossary lookup.

## Notes

The third criterion bounds the check to presence, so nothing here interprets or converts a declared duration.
The standard was read in full and no rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
