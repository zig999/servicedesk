---
title: Case coherence validation over the two query ports
summary: A pure validator under src/case that reads the current glossary and capability registry through their published query ports and refuses a structurally valid case once, with every coherence violation named in one typed error.
task: sha256:a766973c424225061a88a666246210c17f985c073b3a8baad587fac204674c1e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/case-model-case-coherence-validation-build
files:
  - path: src/case/validate-case-coherence.ts
    effect: collects every coherence violation one structurally valid case holds — each named term absent from the glossary, each collected concept rejecting the declared subject type, each collected concept without a current read-only capability declaring an output schema and a timeout — reading IGlossaryQuery and ICapabilityQuery on every call, and either returns the collectable list (caseCoherenceViolations) or refuses once through IncoherentCaseError (validateCaseCoherence)
  - path: src/errors/incoherent-case.error.ts
    effect: the typed refusal of an incoherent case, carrying the slug and every violation in its context the way InvalidCaseDocumentError carries its structural problems, so the reading that joins both refusals can collect them
criteria:
  - criterion: A case naming a subject type, concept, outcome, action or recipient the glossary does not hold is refused, naming the term.
    met: true
    how: namedVocabularyTerms walks the declared subject and every resolution's outcome, action and recipient through readVocabularyTerm, and conceptViolations walks every collected concept through readConcept; each name the glossary does not hold yields one violation naming the role and the term
  - criterion: A case whose collected concept does not accept the declared subject type is refused, naming the concept and the subject type that disagree.
    met: true
    how: conceptViolations reads each held concept's accepts from the glossary resolution and, where it does not carry theCase.subject, pushes a violation naming both the concept and the declared subject type
  - criterion: A case collecting a concept no read-only capability currently answers is refused, naming the concept.
    met: true
    how: capabilityViolations resolves each distinct collected concept through readCapability; an absence yields a violation naming the concept, and answerGaps also names the concept where the resolved capability is not read-only or declares no output schema or no timeout — asserted over what the resolution itself declares, never assumed from the registry's registration refusals
  - criterion: The capability check reads the registration as it stands at the moment of validation, so the same case refused before a capability registers is not refused by that check after it registers.
    met: true
    how: readCapability is called inside each validation and the module holds no state — no cache, no memo, no module-level mutable value — so every validation answers from the registry's holding at that moment
  - criterion: A case violating several coherence rules is refused once, with every violation named.
    met: true
    how: caseCoherenceViolations concatenates the vocabulary, concept and capability violations before anything refuses, and validateCaseCoherence throws exactly one IncoherentCaseError carrying the whole list in context
  - criterion: A case violating no coherence rule is not refused by these rules.
    met: true
    how: every check only appends to the violation list, validateCaseCoherence throws only when that list is non-empty, and caseCoherenceViolations answers an empty list without side effects
  - criterion: The checks reach the glossary and the registry through ports over the published reads, importing no framework, driver or client into the domain modules.
    met: true
    how: the validator takes IGlossaryQuery and ICapabilityQuery as parameters and calls only the published operations; its imports are type-only port interfaces and sibling domain modules, all relative, which the existing purity audit over src/case verifies mechanically
nodes:
  - node: domain/knowledge/case
    encoded_at: [src/case/validate-case-coherence.ts]
    how: the validator walks exactly the aggregate's declared attributes — its subject, its fallback and its hypotheses — and reuses the case's own collection-plan operation for the distinct collected concepts rather than re-deriving the union
  - node: domain/knowledge/hypothesis
    encoded_at: [src/case/validate-case-coherence.ts]
    how: each hypothesis contributes its collects to the concept and capability checks and its resolution to the vocabulary checks, in the case's declared order
  - node: domain/knowledge/resolution
    encoded_at: [src/case/validate-case-coherence.ts]
    how: declaredResolutions reads every position's resolution — each hypothesis's and the fallback's — as the outcome-plus-referral pair, and holds each outcome to the glossary's outcome vocabulary
  - node: domain/knowledge/referral
    encoded_at: [src/case/validate-case-coherence.ts]
    how: the node's responsibility to name one action and one recipient from the glossary is the check itself — every referral's action and recipient are resolved against their vocabularies at reading
  - node: rules/knowledge/case-terms-exist-in-the-glossary
    encoded_at: [src/case/validate-case-coherence.ts]
    how: vocabularyViolations holds the subject type, outcomes, actions and recipients to the glossary and the concept-existence branch holds the collected concepts to it, each absence one violation naming the term
  - node: rules/knowledge/a-concept-accepts-the-declared-subject-type
    encoded_at: [src/case/validate-case-coherence.ts]
    how: the acceptance branch compares each held concept's accepts, as the glossary resolves it, against the case's declared subject, refusing with both names where they disagree
  - node: rules/knowledge/every-collected-concept-has-a-read-only-capability
    encoded_at: [src/case/validate-case-coherence.ts]
    how: answerGaps demands, per collected concept, a currently answering capability that is read-only and declares an output schema and a timeout — the rule's whole statement, including the contract clause no criterion reached, per the task's first UNDERDETERMINED note
  - node: rules/knowledge/the-contract-check-reads-the-current-registration
    encoded_at: [src/case/validate-case-coherence.ts]
    how: capabilityViolations resolves each concept through the port inside the very validation call and remembers nothing between calls, so the check reads the registration as it stands now, never a remembered one
  - node: contracts/knowledge/vocabulary-terms
    encoded_at: [src/case/validate-case-coherence.ts]
    how: the consumed contract's two operations, read-vocabulary-term and read-concept, are the only glossary reads the checks perform, reached through IGlossaryQuery alone
  - node: contracts/knowledge/capability-check
    encoded_at: [src/case/validate-case-coherence.ts]
    how: the consumed contract's one operation, read-capability, is the only registry read the checks perform, reached through ICapabilityQuery alone
  - node: contracts/system/case-authoring
    encoded_at: [src/case/validate-case-coherence.ts, src/errors/incoherent-case.error.ts]
    how: the coherence rules answer at reading with all their refusals at once in one typed error; scoped per the task's second UNDERDETERMINED note to coherence over a structurally valid case, with caseCoherenceViolations exported as the seam read-case joins structural problems through into the capability's one promised refusal
  - node: scenarios/knowledge/a-subject-mismatch-refuses-the-case
    encoded_at: [src/case/validate-case-coherence.ts]
    how: a case declaring subject customer whose hypothesis collects equipment-state resolves that concept as held with accepts carrying only contract, the acceptance branch finds customer absent from accepts, and the validation refuses at reading with the violation naming both the concept and the subject type
  - node: constraints/the-domain-depends-on-no-infrastructure
    how: honored rather than encoded — the validator imports only sibling domain modules and type-only port interfaces, so the existing dependency audit over src/case continues to find nothing forbidden
inferences:
  - inferred: coherence violations travel as prose strings inside one typed error's context, with the collector exported separately from the refusing function
    from: the task's Notes binding the one joint refusal to the read-case composition, and the refusal convention of InvalidCaseDocumentError, whose context carries the file and its problems the same way
  - inferred: each distinct term is checked once and yields at most one existence violation, however many positions name it
    from: the case's collection-plan operation deduplicating the union of collects, and criterion 1's refusal naming the term rather than each position
  - inferred: the three rules are checked independently, so one wrong name can be named by more than one violation
    from: the rules being separate policies whose statements hold on their own, and criterion 5's requirement that every violation be named at once
  - inferred: declares-an-output-schema-and-a-timeout reads as an output schema that is a non-empty string and a timeout that is an integer count of milliseconds
    from: the refusal convention that an empty attribute declares nothing, and the registry's own registration check, which refuses an empty attribute and a non-integer timeout
  - inferred: violations answer in a stable order — vocabulary terms first, then concepts, then capabilities, each group in the case's declared order
    from: nothing states an order; the case's declared order is what the module beside it already preserves, so a curator re-reading a refusal meets the same list
  - inferred: a registry holding that answers one concept with more than one capability propagates as the port's own DuplicateConceptAnswerError rather than becoming a coherence violation of the case
    from: the port's read-capability documenting that refusal as the read's own, and no node of this task assigning an upstream integrity failure to the case being validated
preserved:
  - the purity audit over src/case, which the new module keeps true — only relative specifiers, no forbidden package
  - parseCaseDocument's structural refusal and InvalidCaseDocumentError, untouched — structural validity stays the document-model task's and is presupposed here
  - case-resolution's three operations, untouched — collectionPlan is imported, never modified
  - both query ports and the services answering them, untouched
deferred:
  - what: the one refusal that joins structural problems and coherence violations at reading, which contracts/system/case-authoring promises whole.
    why: the task's Notes scope the at-once guarantee here to coherence over a structurally valid case and place the composition at read-case; caseCoherenceViolations is exported as that task's seam
  - what: wiring the validator to the live GlossaryService and CapabilityRegistryService.
    why: the plan's Advisory binds this task's ports to fakes — the live adapters are other epics' seam, and the consuming reading is read-case's to wire
---
## What it is
Where the knowledge context negotiates with the glossary and the integration context, as one pure function pair: the collector that names every coherence violation and the refuser that throws them once.
Both UNDERDETERMINED notes are answered — the capability check asserts the resolved capability's own declarations, and the collector is exported precisely so read-case can compose the one joint refusal the capability promises.

## Notes
The stable violation order is the record's small inference for the curator: the same case refuses with the same list in the same order, so a re-read is a diff.
An upstream registry integrity failure propagates as the port's own error rather than becoming a violation of the case under validation — the case is not wrong because the registry is.
