---
title: "The check that a collected concept accepts the case's declared subject type"
summary: "The publication check that refuses a case under edit, once per offending concept, when a hypothesis collects a concept whose accepts list excludes the case's own declared subject type."
task: sha256:5c45a3325b46e97b705d18194ee5fabeb608298ec64b8cf6487fa5adb2786587
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/concept-accepts-the-declared-subject-type.ts
    effect: "declares createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary), a factory yielding a PublicationCheck that walks every hypothesis of the case under edit and every concept name it collects, looks each up through the shared glossary lookup, and pushes one refusal — naming the rule, the hypothesis and the offending concept as the offended term — for every looked-up concept whose accepts list does not include the case's own subjectType; a concept absent from the given glossary produces no refusal here, and an empty hypotheses list, an empty collects list or any subject type value is walked without throwing"
criteria:
  - criterion: "A case collecting one concept that does not accept the case's declared subject type is refused by this check."
    met: true
    how: "the concept is found via publishedConcept(), concept.accepts.includes(draftCase.subjectType) is false, and one refusal is pushed naming the rule, the collecting hypothesis and the concept — a non-empty answer is the case refused by this check"
  - criterion: "A case whose every collected concept accepts the case's declared subject type is not refused by this check."
    met: true
    how: "for every hypothesis and every concept it collects, concept.accepts.includes(draftCase.subjectType) is true, so the inner condition never holds and no refusal is ever pushed; the check answers a frozen empty array"
  - criterion: "A case collecting a concept that accepts several subject types including the declared one is not refused by this check."
    met: true
    how: "the comparison is Array.prototype.includes over the whole accepts list, not a single-value equality, so a concept whose accepts list holds several subject types answers true as long as one of them is the case's declared subjectType, and no refusal is pushed for it"
nodes:
  - node: definition/knowledge/case
    how: "src/knowledge/case.ts is untouched; this check enforces the node's collected-concept-accepts-subject-type clause before publication, at the case-under-edit stage the draft-case node's own rule constrains. The task's waived gap, attributes.version.derivation, is untouched — this check reads neither the version nor how it is set."
  - node: definition/knowledge/draft-case
    encoded_at:
      - src/knowledge/concept-accepts-the-declared-subject-type.ts
    how: "the check reads exactly draftCase.subjectType and draftCase.hypotheses[].collects over the shape draft-case.ts already declares, walking an empty hypotheses list without throwing, honoring the node's rule that a case under edit is what a publication check refuses"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/concept-accepts-the-declared-subject-type.ts
    how: "the check walks each hypothesis's own collects list — concept names bound by identity, unchanged from hypothesis.ts — and names the offending hypothesis by its own identity field, hypothesis.name, in each refusal it produces"
  - node: definition/glossary/concept
    encoded_at:
      - src/knowledge/concept-accepts-the-declared-subject-type.ts
    how: "the check consults a concept's own declared accepts list, read through the shared lookup's publishedConcept() rather than restating it; the node's other clauses — that the named concept must exist in the glossary, must declare a ttl, must declare the fields its answer carries — are the sibling checks' (terms-exist-in-the-glossary, concept-declares-a-ttl, hypothesis-collects-a-concept, read-only-capability), consistent with the task's own waived note that neither refusing nor ignoring a concept the glossary does not publish fails any criterion here. The task's waived gap, attributes.ttl.unit, is untouched — this check never reads ttl."
  - node: definition/glossary/subject-type
    encoded_at:
      - src/knowledge/concept-accepts-the-declared-subject-type.ts
    how: "the check's whole behaviour is the node's own rule, 'Every concept a case collects must accept the type of subject that case declares', read as concept.accepts.includes(draftCase.subjectType) — a membership test by identity, which holds unchanged for whatever the vocabulary comes to hold. The task's waived gap, attributes.name.values, is untouched for that reason."
  - node: rule/knowledge/concept-accepts-the-declared-subject-type
    encoded_at:
      - src/knowledge/concept-accepts-the-declared-subject-type.ts
    how: "the produced refusal's rule field carries the node's own path as its identifier and its text quotes the node's statement unchanged, 'Every concept a case collects MUST accept the type of subject that case declares.'; the refusing condition is exactly !concept.accepts.includes(draftCase.subjectType)"
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    how: "the check never throws over an empty hypotheses list, a hypothesis with an empty collects list, or any subjectType value — each simply narrows or empties what is compared — honoring the rule's clause that a check must be safe over a malformed case, though the task's own UNDERDETERMINED note leaves that optional here. The rule's other clauses, that a validation runs every check regardless of an earlier one and answers with everything produced, reach no criterion of this task and are the validation-run task's, already delivered at src/knowledge/validation.ts"
inferences:
  - inferred: "the check is built by a factory, createConceptAcceptsTheDeclaredSubjectTypeCheck(glossary): PublicationCheck, rather than a plain function taking the glossary and the case as two parameters"
    from: "PublicationCheck's own declared contract at src/knowledge/validation.ts is a function of the whole case under edit alone, and validate() takes a checks list of exactly that shape; closing over the glossary at construction is what lets whatever assembles the checks list register this check with no adaptation, the same way caseHasAtLeastOneHypothesis — which needs no glossary — already registers directly"
  - inferred: "a concept name a hypothesis collects that the given glossary does not publish produces no refusal from this check"
    from: "the task's own note that neither refusing nor ignoring an unpublished concept fails any stated criterion, since such a concept has no accepts list to consult, and the every-refusal rule guarantees the terms-exist-in-the-glossary check runs regardless and owns that refusal"
  - inferred: "the check walks an empty hypotheses list, a hypothesis with an empty collects list, and any value the subject type holds without throwing"
    from: "the task's own UNDERDETERMINED note that leaves this open, together with the tree's existing precedent at case-has-at-least-one-hypothesis.ts and the every-refusal rule's clause that a check should be safe over a malformed case"
  - inferred: "the refusal's rule field is the literal string 'rule/knowledge/concept-accepts-the-declared-subject-type', the node's own path, and the curator-facing text quotes the node's statement attribute unchanged"
    from: "the base's path-is-identity convention together with definition/knowledge/refusal's own doc comment, and the identical choice already recorded by the case-has-at-least-one-hypothesis implementation for its own rule and text fields"
  - inferred: "the returned refusals array is frozen with Object.freeze"
    from: "the tree's existing copy/freeze habit at validate(), requiredEvaluations() and caseHasAtLeastOneHypothesis, all of which freeze what they hand back"
preserved:
  - "PublicationCheck's type and validate() at src/knowledge/validation.ts are untouched, and the new check's inner closure matches PublicationCheck structurally so it can be registered into validate()'s checks list with no change there"
  - "DraftCase at src/knowledge/draft-case.ts, Hypothesis at src/knowledge/hypothesis.ts and Refusal at src/knowledge/refusal.ts are untouched and read exactly as declared"
  - "PublishedGlossary and publishedConcept at src/glossary/lookup.ts are untouched and consumed exactly as declared, including that publishedConcept yields the glossary's own Concept record rather than a copy"
  - "caseHasAtLeastOneHypothesis at src/knowledge/case-has-at-least-one-hypothesis.ts is untouched and unaffected by this addition"
  - "every existing spec under src/__tests__/unit/ exercises only modules this delivery did not touch, and continues to hold unchanged"
deferred:
  - what: "assembling the full list of publication checks a real validation run registers, and wiring createConceptAcceptsTheDeclaredSubjectTypeCheck's result into that list alongside a glossary"
    why: "validate() takes the checks list as a parameter supplied by its caller; per the validation-run task's own binding note, each check is a parameter of the run and whatever assembles the checks list is its own concern outside every individual check task"
  - what: "the sibling checks of this epic that also consume the glossary lookup — terms-exist-in-the-glossary, recipient-is-a-role, unique-hypothesis-names, concept-declares-a-ttl, hypothesis-collects-a-concept, read-only-capability"
    why: "each is its own task of this epic, and writing one here would reach past this task's objective, which is exactly the subject-type acceptance check"
  - what: "the repository still holds no package manifest, compiler configuration or lock, so src/knowledge/concept-accepts-the-declared-subject-type.ts has never been type-checked, the same as every other file already in the tree"
    why: "establishing the toolchain is no criterion of this task and reaches every file in src/, not only this one; the inventory and every prior delivery already record the absence"
---

## What it is

The vocabulary check standing behind the base's statement that a case cannot ask for a fact that does not apply to what it investigates — a refusal decided by pairing each collected concept with the one subject type the case declares.

## Notes

The check reads what the glossary records for a concept through the shared lookup rather than restating it.
The standard was read in full and no rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
