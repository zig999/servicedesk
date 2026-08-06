---
title: "Every named term a case uses exists in the glossary"
summary: "The publication check that refuses a case under edit naming a subject type, concept, outcome, action or recipient the glossary does not publish under the kind the case uses it as, reading the case's own subject type, every hypothesis's collected concepts, every hypothesis's own resolution and both of the case's fallback resolutions alike."
task: sha256:d3f2ca5ed6af49df0f96bfb82af74fdeef43cceb82ca66b4a024d434075fbd34
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/case-terms-exist-in-the-glossary.ts
    effect: "declares createCaseTermsExistInTheGlossaryCheck(glossary), a factory closing over a PublishedGlossary and returning a PublicationCheck that walks the case under edit's own declared subject type, every hypothesis's collects list, every hypothesis's own resolution and both present fallback resolutions, and pushes one refusal — naming the rule, the hypothesis where one applies, and the offending term — for every subject type, concept, outcome, action or recipient the given glossary does not publish under the matching kind; walks an empty hypotheses list, an absent fallback and an absent subject type without throwing and without refusing for any of those absences"
criteria:
  - criterion: "A case collecting a concept the glossary does not publish is refused by this check."
    met: true
    how: "unpublishedConceptRefusals calls isPublished(glossary, conceptName, 'concept') for every name in each hypothesis's collects list; where it answers false a refusal is pushed naming the rule, the collecting hypothesis and the concept as the offended term, and the outer function includes every such refusal in its answer"
  - criterion: "A case whose resolution names an outcome the glossary does not publish is refused by this check."
    met: true
    how: "unpublishedResolutionTermRefusals calls isPublished(glossary, resolution.outcome, 'outcome') against every hypothesis's own resolution and both present fallback resolutions; where it answers false a refusal is pushed naming the rule, the position (the hypothesis, or absent for a fallback) and the outcome as the offended term"
  - criterion: "A case whose referral names an action the glossary does not publish is refused by this check."
    met: true
    how: "the same unpublishedResolutionTermRefusals call also checks isPublished(glossary, resolution.referral.action, 'action') against every hypothesis's own resolution and both present fallback resolutions, pushing a refusal naming the rule, the position and the action where it is not published"
  - criterion: "A case whose referral names a recipient the glossary does not publish is refused by this check."
    met: true
    how: "the same function also checks isPublished(glossary, resolution.referral.recipient, 'recipient') against every hypothesis's own resolution and both present fallback resolutions, pushing a refusal naming the rule, the position and the recipient where it is not published — confirmed as this task's own criterion by its note that the recipient-is-a-role rule's own text grounds criterion 4's scope as an existence test, distinct from and in addition to the identically-scoped check already delivered at src/knowledge/recipient-is-a-role.ts"
  - criterion: "A case declaring a subject type the glossary does not publish is refused by this check."
    met: true
    how: "unpublishedSubjectTypeRefusal calls isPublished(glossary, draftCase.subjectType, 'subject-type'); where it answers false and the subject type is present at all, it returns a refusal naming the rule, no hypothesis (the subject type is the case's own, not a hypothesis's) and the subject type as the offended term"
  - criterion: "A case whose every named term the glossary publishes under the kind the case uses it as is not refused by this check."
    met: true
    how: "where isPublished answers true for the subject type, every collected concept, and the outcome/action/recipient of every hypothesis's resolution and both present fallbacks, every one of the four refusal-producing functions returns undefined or an empty array, nothing is pushed, and createCaseTermsExistInTheGlossaryCheck's returned function answers a frozen empty array"
nodes:
  - node: aggregate/knowledge/cases
    how: "honored rather than encoded: this is one PublicationCheck taking the whole case under edit as its only input and reading every position it names a term from — the subject type, every hypothesis's collects list, every hypothesis's resolution, and both fallback resolutions — matching the aggregate's rule that the contract checks run over the whole"
  - node: definition/knowledge/case
    how: "not reached directly — the check runs over the case under edit, before a case exists, and its shape governs only through draft-case.ts. The task's waived gap, attributes.version.derivation, is untouched: nothing in this module reads a version or a content hash"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "reads hypothesis.name as the refusal's position, hypothesis.collects as the list of concept names checked by unpublishedConceptRefusals, and hypothesis.resolution as the resolution checked by unpublishedResolutionTermRefusals; the criterion prose (confirmsWhen) is not read"
  - node: definition/knowledge/resolution
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "each of the three resolutions a case can carry a term in — a hypothesis's own, the no-data fallback, the hypotheses-exhausted fallback — is passed through the identical unpublishedResolutionTermRefusals function, which reads its .outcome and its .referral, answering criteria 2 to 4 over all three alike"
  - node: definition/knowledge/referral
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "reads resolution.referral.action and resolution.referral.recipient, both terms this check tests, unlike its sibling recipient-is-a-role.ts which reads only the recipient half"
  - node: definition/glossary/concept
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "read through the shared exact-match lookup (isPublished(glossary, conceptName, 'concept')) rather than restated; the node's other clauses — the ttl, the declared fields, the accepted subject type, the read-only-capability requirement — are the sibling checks' own. The task's waived gap, attributes.ttl.unit, is untouched: this check never reads a ttl"
  - node: definition/glossary/subject-type
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "read through the shared lookup (isPublished(glossary, draftCase.subjectType, 'subject-type')); the node's own membership-comparison rule (that every concept a case collects must accept this declared subject type) is the sibling concept-accepts-the-subject-type check's own. The task's waived gap, attributes.name.values, is untouched: no subject-type name is enumerated or hardcoded"
  - node: definition/glossary/outcome
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "read through the shared lookup (isPublished(glossary, resolution.outcome, 'outcome')). The task's waived gap, attributes.name.values.[], is untouched: no outcome name is enumerated or hardcoded, only compared against whatever the given glossary publishes"
  - node: definition/glossary/action
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "read through the shared lookup (isPublished(glossary, resolution.referral.action, 'action')). The task's waived gap, attributes.name.values, is untouched for the same reason as outcome and recipient"
  - node: definition/glossary/recipient
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "read through the shared lookup (isPublished(glossary, resolution.referral.recipient, 'recipient')), the same existence test src/knowledge/recipient-is-a-role.ts already performs; the two checks decide the identical clause independently rather than one calling the other. The task's waived gap, attributes.name.values, is untouched"
  - node: definition/knowledge/draft-case
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "encoded as the check's parameter type: reads draftCase.subjectType, draftCase.hypotheses, draftCase.noDataFallback and draftCase.hypothesesExhaustedFallback, and walks an empty hypotheses list, an absent fallback or an absent subject type without throwing and without refusing for any of those absences — the same malformed shape draft-case.ts documents as admitted on purpose so a check can walk it"
  - node: rule/knowledge/case-terms-exist-in-the-glossary
    encoded_at:
      - src/knowledge/case-terms-exist-in-the-glossary.ts
    how: "RULE_IDENTIFIER and REFUSAL_TEXT cite this rule and quote its statement verbatim; every refusal this check produces is exactly this rule's own sentence, decided over all five of its clauses — subject type, concept, outcome, action and recipient — rather than four of the five, per the task's own note confirming criterion 4's scope"
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    how: "honored for its per-check clause: presentFallbacks() reads the case's two fallbacks rather than indexing into them, the subject-type check reads rather than indexes into an absent subject type, and the loop over draftCase.hypotheses walks an empty list without failing, so the check refuses nothing for any part of the case that is missing rather than throwing over it. The rule's two composition clauses are validation-run's own to bind, per this task's fourth REMAINDER note; this check only had to be writable as a PublicationCheck under them, which it is"
inferences:
  - inferred: "the check decides the recipient clause of the terms-exist rule in addition to subject-type, concept, outcome and action, even though src/knowledge/recipient-is-a-role.ts already decides that same clause under the same rule identifier and refusal text"
    from: "this task's own criterion 4, which literally states the recipient clause as one of this check's criteria, together with its note that the recipient-is-a-role rule's own statement — that a check over a case tests only existence — confirms criterion 4's scope; the recipient-is-a-role task's own REMAINDER note assigns the recipient clause to itself and the other four to 'the sibling checks', which reads as excluding recipient from this task, but this task's stated criteria override that reading for what this record answers to, since a delivery answers the task's own text"
  - inferred: "an absent draftCase.subjectType is read as nothing to refuse for, rather than compared against the glossary as an unpublished term"
    from: "this task's own note that the check 'walks a malformed case without failing, refusing nothing for the absent parts, since other checks own those absences', extended from the fallback fields — where the same reasoning is already established at src/knowledge/recipient-is-a-role.ts — to the case's own subject type, which this check also reads outside any hypothesis"
  - inferred: "the check is built as a factory over the glossary (createCaseTermsExistInTheGlossaryCheck(glossary): PublicationCheck) rather than as a plain function of the case"
    from: "the convention already established by every glossary-consuming sibling check — concept-accepts-the-declared-subject-type.ts, every-collected-concept-declares-a-ttl.ts, recipient-is-a-role.ts — built the same way for the same stated reason"
  - inferred: "the five kind constants (SUBJECT_TYPE_KIND, CONCEPT_KIND, OUTCOME_KIND, ACTION_KIND, RECIPIENT_KIND) are typed as the shared GlossaryKind rather than bare string literals"
    from: "src/glossary/lookup.ts's own exported GlossaryKind type, reused rather than restated, and the identical choice already recorded by recipient-is-a-role's own RECIPIENT_KIND constant"
  - inferred: "within one check() call, refusals are produced in this order: the subject type, then per hypothesis in declared order (its collected concepts, then its resolution's outcome/action/recipient), then the no-data fallback's outcome/action/recipient, then the hypotheses-exhausted fallback's outcome/action/recipient"
    from: "no criterion or note pins an order across the five clauses; the chosen order follows each bound node's own attribute declaration order — case.md declares subject_type before hypotheses before the two fallbacks, hypothesis.md declares collects before resolution, resolution.md declares outcome before referral, and referral.md declares action before recipient — and recipient-is-a-role.ts's own precedent of the no-data fallback before the hypotheses-exhausted one"
divergences:
  - cites: MNT-03
    file: src/knowledge/case-terms-exist-in-the-glossary.ts
    departure: "presentFallbacks() is redefined here nearly verbatim from the function of the same name and behavior already written at src/knowledge/recipient-is-a-role.ts, rather than that existing logic being called"
    why: "the existing function is module-private (not exported), consistent with the inventory's own recorded convention that this tree's helper functions are written module-private per module; exporting it and importing it here would mean editing a previously delivered task's file outside this task's own objective, and introducing a new shared-helpers module is a source-layout decision no task or inventory convention in scope establishes. Duplicating the three-line guard was judged cheaper than either alternative and is disclosed here rather than resolved unilaterally"
preserved:
  - "PublicationCheck's type and validate() at src/knowledge/validation.ts are untouched, and this check's returned closure matches PublicationCheck structurally so it can be registered into validate()'s checks list with no change there"
  - "DraftCase at src/knowledge/draft-case.ts, Hypothesis at src/knowledge/hypothesis.ts, Resolution at src/knowledge/resolution.ts, Referral at src/knowledge/referral.ts and Refusal at src/knowledge/refusal.ts are untouched and read exactly as declared"
  - "PublishedGlossary, GlossaryKind and isPublished at src/glossary/lookup.ts are untouched and consumed exactly as declared"
  - "src/knowledge/recipient-is-a-role.ts and every other sibling check already delivered in this epic (case-has-at-least-one-hypothesis.ts, hypothesis-collects-at-least-one-concept.ts, concept-accepts-the-declared-subject-type.ts, every-collected-concept-declares-a-ttl.ts, every-collected-concept-has-a-read-only-capability.ts) are untouched and unaffected by this addition"
  - "every existing spec under src/__tests__/unit/ exercises only modules this delivery did not touch, and continues to hold unchanged"
deferred:
  - what: "assembling the full list of publication checks a real validation run registers, and wiring this check's result into that list alongside a glossary"
    why: "validate() takes the checks list as a parameter supplied by its caller; per the validation-run task's own binding note, each check is a parameter of the run and whatever assembles the checks list is its own concern outside every individual check task"
  - what: "whether the recipient clause being decided independently by both this check and src/knowledge/recipient-is-a-role.ts should instead be decided by only one of the two, or whether both belong registered together in a real run"
    why: "which checks a run actually registers is the composition concern this task's own REMAINDER note assigns to validation-run, not to an individual check; this task answers its own stated criteria, including criterion 4, without editing or removing the sibling check"
  - what: "whether a registered recipient truly names a role rather than a person, and the subject-type acceptance, ttl, observation-field and read-only-capability obligations the bound structure and glossary definitions also carry"
    why: "each is restated by its own dedicated rule node this task deliberately does not bind, per the task's own REMAINDER note, and belongs to the sibling task that binds it (recipient-is-a-role, concept-accepts-the-subject-type, concept-declares-a-ttl, read-only-capability)"
  - what: "whether a case declares both fallbacks, or a subject type, at all"
    why: "this check reads rather than indexes into an absent fallback or an absent subject type and refuses nothing for that absence; refusing for the absence itself belongs to whichever check enforces the case's own structural minimums, which this task's note assigns to other checks ('other checks own those absences')"
  - what: "the repository still holds no package manifest, compiler configuration or lock, so src/knowledge/case-terms-exist-in-the-glossary.ts has never been type-checked, the same as every other file already in the tree"
    why: "establishing the toolchain is no criterion of this task and reaches every file in src/, not only this one; the inventory and every prior delivery already record the absence"
---

## What it is

The vocabulary check standing behind the base's statement that a case speaks only the published language — one refusal covering every position in which a case names a term, so nothing a case names is invented in place.

## Notes

The criteria enumerate the positions a case names terms in, not the terms themselves, because the members of each vocabulary are the glossary's to publish.
The check decides against the glossary it is given through the shared lookup and holds no vocabulary of its own.
This check decides the recipient clause independently of the already-delivered src/knowledge/recipient-is-a-role.ts, which decides the same clause under the same rule; the two are disclosed rather than merged, per this task's own criterion 4 and its note grounding that scope, and merging or deduplicating them is left to whatever assembles a real validation run's checks list.
The standard was read in full; one MNT-03 departure is disclosed above, and no other rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
